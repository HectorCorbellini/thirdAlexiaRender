import express from 'express';
import { prisma } from '../index';
import { authenticateToken, AuthRequest } from '../middlewares/auth';

const router: express.Router = express.Router();

// Dashboard overview
router.get('/overview', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    // Filter by business if not admin
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    }

    if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const [
      totalLeads,
      totalConversations,
      totalMessages,
      activeWhatsAppUsers,
      leadsByStatus,
      recentActivity
    ] = await Promise.all([
      // Total leads
      prisma.lead.count({ where }),
      
      // Total conversations
      prisma.conversation.count({
        where: {
          waUser: { businessId: where.businessId }
        }
      }),
      
      // Total messages
      prisma.message.count({
        where: {
          conversation: {
            waUser: { businessId: where.businessId }
          }
        }
      }),
      
      // Active WhatsApp users
      prisma.whatsAppUser.count({
        where: {
          businessId: where.businessId,
          isActive: true
        }
      }),
      
      // Leads by status
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
        _sum: { value: true }
      }),
      
      // Recent activity (last 10 leads)
      prisma.lead.findMany({
        where,
        include: {
          waUser: { select: { name: true, waId: true } },
          campaign: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    res.json({
      summary: {
        totalLeads,
        totalConversations,
        totalMessages,
        activeWhatsAppUsers
      },
      leadsByStatus: leadsByStatus.map(stat => ({
        status: stat.status,
        count: stat._count._all,
        value: stat._sum.value || 0
      })),
      recentActivity
    });
  } catch (error) {
    next(error);
  }
});

// Messages analytics
router.get('/messages', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      timestamp: { gte: startDate }
    };

    // Filter by business
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.conversation = {
        waUser: { businessId: req.user.businessId }
      };
    } else if (req.query.businessId) {
      where.conversation = {
        waUser: { businessId: req.query.businessId }
      };
    }

    const messageStats = await prisma.message.groupBy({
      by: ['direction'],
      where,
      _count: { _all: true }
    });

    const dailyMessages = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        direction,
        COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      JOIN whatsapp_users wu ON c.wa_user_id = wu.id
      WHERE timestamp >= ${startDate}
      ${req.user.businessId ? `AND wu.business_id = '${req.user.businessId}'` : ''}
      GROUP BY DATE(timestamp), direction
      ORDER BY date DESC
    `;

    res.json({
      messageStats: messageStats.map(stat => ({
        direction: stat.direction,
        count: stat._count._all
      })),
      dailyMessages
    });
  } catch (error) {
    next(error);
  }
});

// Conversion funnel
router.get('/funnel', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    } else if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const funnel = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
      _sum: { value: true }
    });

    // Calculate conversion rates
    const statusOrder = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];
    const funnelData = statusOrder.map(status => {
      const stat = funnel.find(f => f.status === status);
      return {
        status,
        count: stat?._count._all || 0,
        value: stat?._sum.value || 0
      };
    });

    res.json({ funnel: funnelData });
  } catch (error) {
    next(error);
  }
});

// Top performing campaigns
router.get('/campaigns/performance', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const where: any = {};
    
    if (req.user.role !== 'SUPERADMIN' && req.user.role !== 'ADMIN') {
      where.businessId = req.user.businessId;
    } else if (req.query.businessId) {
      where.businessId = req.query.businessId;
    }

    const campaignPerformance = await prisma.campaign.findMany({
      where,
      include: {
        _count: {
          select: {
            leads: true
          }
        },
        leads: {
          select: {
            status: true,
            value: true
          }
        }
      },
      orderBy: {
        leads: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const performanceData = campaignPerformance.map(campaign => {
      const totalLeads = campaign._count.leads;
      const convertedLeads = campaign.leads.filter(l => l.status === 'CONVERTED').length;
      const totalValue = campaign.leads
        .filter(l => l.status === 'CONVERTED')
        .reduce((sum, l) => sum + (l.value || 0), 0);

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalLeads,
        convertedLeads,
        conversionRate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
        totalValue
      };
    });

    res.json(performanceData);
  } catch (error) {
    next(error);
  }
});

export default router;