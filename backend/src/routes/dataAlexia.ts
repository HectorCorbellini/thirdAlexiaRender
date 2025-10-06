import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router: express.Router = express.Router();

const dataAlexiaSchema = Joi.object({
  businessId: Joi.string().required(),
  category: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  location: Joi.object().optional(),
  priority: Joi.number().default(0),
  isActive: Joi.boolean().default(true)
});

// Get data entries
router.get('/', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Filter by business if not admin
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }
    if (req.query.category) {
      where.category = req.query.category;
    }
    if (req.query.search) {
      where.OR = [
        { title: { contains: req.query.search as string, mode: 'insensitive' } },
        { content: { contains: req.query.search as string, mode: 'insensitive' } }
      ];
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.dataAlexia.findMany({
        where,
        include: {
          business: { select: { id: true, name: true } }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.dataAlexia.count({ where })
    ]);

    res.json({
      data,
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

// Get single data entry
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const data = await prisma.dataAlexia.findUnique({
      where: { id: req.params.id },
      include: {
        business: { select: { id: true, name: true } }
      }
    });

    if (!data) {
      return res.status(404).json({ error: 'Data entry not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== data.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create data entry
router.post('/', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MERCHANT', 'EDITOR']), async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = dataAlexiaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check business access
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== value.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const data = await prisma.dataAlexia.create({
      data: value,
      include: {
        business: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update data entry
router.put('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'MERCHANT', 'EDITOR']), async (req: AuthRequest, res, next) => {
  try {
    const data = await prisma.dataAlexia.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!data) {
      return res.status(404).json({ error: 'Data entry not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== data.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = dataAlexiaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedData = await prisma.dataAlexia.update({
      where: { id: req.params.id },
      data: value,
      include: {
        business: { select: { id: true, name: true } }
      }
    });

    res.json(updatedData);
  } catch (error) {
    next(error);
  }
});

// Delete data entry
router.delete('/:id', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN', 'EDITOR']), async (req: AuthRequest, res, next) => {
  try {
    const data = await prisma.dataAlexia.findUnique({
      where: { id: req.params.id },
      select: { businessId: true }
    });

    if (!data) {
      return res.status(404).json({ error: 'Data entry not found' });
    }

    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.businessId !== data.businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.dataAlexia.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Data entry deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/meta/categories', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const categories = await prisma.dataAlexia.findMany({
      where,
      select: {
        category: true
      },
      distinct: ['category']
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
});

export default router;