import express from 'express';
import { prisma } from '../index';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import Joi from 'joi';

const router: express.Router = express.Router();

const businessSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  location: Joi.object().optional(),
  settings: Joi.object().default({})
});

// Get all businesses (Admin/Superadmin only)
router.get('/', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: {
          select: {
            whatsappUsers: true,
            campaigns: true,
            leads: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(businesses);
  } catch (error) {
    next(error);
  }
});

// Get single business
router.get('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.params.id;
    
    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        campaigns: { take: 5, orderBy: { createdAt: 'desc' } },
        leads: { take: 10, orderBy: { createdAt: 'desc' } },
        _count: {
          select: {
            whatsappUsers: true,
            campaigns: true,
            leads: true,
            dataAlexia: true
          }
        }
      }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    next(error);
  }
});

// Create business
router.post('/', authenticateToken, requireRole(['SUPERADMIN', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const { error, value } = businessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const business = await prisma.business.create({
      data: value,
      include: {
        users: true,
        _count: {
          select: {
            whatsappUsers: true,
            campaigns: true,
            leads: true
          }
        }
      }
    });

    res.status(201).json(business);
  } catch (error) {
    next(error);
  }
});

// Update business
router.put('/:id', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const businessId = req.params.id;
    
    // Check access rights
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN' && req.user.businessId !== businessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error, value } = businessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const business = await prisma.business.update({
      where: { id: businessId },
      data: value,
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        _count: {
          select: {
            whatsappUsers: true,
            campaigns: true,
            leads: true
          }
        }
      }
    });

    res.json(business);
  } catch (error) {
    next(error);
  }
});

// Delete business
router.delete('/:id', authenticateToken, requireRole(['SUPERADMIN']), async (req: AuthRequest, res, next) => {
  try {
    await prisma.business.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;