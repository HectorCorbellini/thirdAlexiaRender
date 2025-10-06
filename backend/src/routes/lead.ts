import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router: express.Router = express.Router();

const leadUpdateSchema = Joi.object({
  status: Joi.string().valid('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST').optional(),
  value: Joi.number().optional(),
  notes: Joi.string().optional(),
  contactData: Joi.object().optional()
});

// Get leads
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Filter by business if not admin
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    // Apply filters
    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.campaignId) {
      where.campaignId = req.query.campaignId;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          waUser: { select: { name: true, waId: true, phone: true } },
          business: { select: { id: true, name: true } },
          campaign: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.lead.count({ where })
    ]);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single lead
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        waUser: {
          select: { name: true, waId: true, phone: true, lastLocation: true },
          include: {
            conversations: {
              include: {
                messages: {
                  orderBy: { timestamp: 'desc' },
                  take: 10
                }
              },
              where: { status: 'ACTIVE' },
              take: 1
            }
          }
        },
        business: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true } }
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== lead.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Update lead
router.put('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MERCHANT']), async (req: AuthRequest, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== lead.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = leadUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: req.params.id },
      data: value,
      include: {
        waUser: { select: { name: true, waId: true, phone: true } },
        business: { select: { id: true, name: true } },
        campaign: { select: { id: true, name: true } }
      }
    });

    res.json(updatedLead);
  } catch (error) {
    next(error);
  }
});

// Delete lead
router.delete('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.businessId !== lead.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.lead.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get lead statistics
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Filter by business if not admin
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const stats = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
      _sum: { value: true }
    });

    const totalLeads = stats.reduce((sum, stat) => sum + stat._count._all, 0);
    const totalValue = stats.reduce((sum, stat) => sum + (stat._sum.value || 0), 0);

    res.json({
      totalLeads,
      totalValue,
      byStatus: stats.map(stat => ({
        status: stat.status,
        count: stat._count._all,
        value: stat._sum.value || 0
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;