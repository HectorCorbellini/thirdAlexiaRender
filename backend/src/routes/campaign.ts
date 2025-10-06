import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router: express.Router = express.Router();

const campaignSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED').default('DRAFT'),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  businessId: Joi.string().required()
});

// Get campaigns
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Filter by business if not admin
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    // Filter by business from query
    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        business: { select: { id: true, name: true } },
        _count: {
          select: { leads: true, metrics: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// Get single campaign
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        business: { select: { id: true, name: true } },
        leads: { 
          take: 20, 
          orderBy: { createdAt: 'desc' },
          include: {
            waUser: { select: { name: true, waId: true } }
          }
        },
        metrics: {
          orderBy: { date: 'desc' },
          take: 10
        },
        _count: {
          select: { leads: true, metrics: true }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== campaign.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// Create campaign
router.post('/', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MERCHANT']), async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = campaignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check business access
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== value.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const campaign = await prisma.campaign.create({
      data: value,
      include: {
        business: { select: { id: true, name: true } },
        _count: {
          select: { leads: true, metrics: true }
        }
      }
    });

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// Update campaign
router.put('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MERCHANT']), async (req: AuthRequest, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== campaign.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = campaignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: value,
      include: {
        business: { select: { id: true, name: true } },
        _count: {
          select: { leads: true, metrics: true }
        }
      }
    });

    res.json(updatedCampaign);
  } catch (error) {
    next(error);
  }
});

// Delete campaign
router.delete('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.businessId !== campaign.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.campaign.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;