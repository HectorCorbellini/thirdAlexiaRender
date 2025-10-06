import { prisma } from '../index';
import { logger } from '../utils/logger';
import { Message } from './messaging/MessagingProvider';

export interface UnifiedUser {
  id: string;
  name?: string;
  platform: string;
  platformUserId: string;
  phone?: string;
  lastLocation?: any;
}

export class UserService {
  /**
   * Find or create a user across all platforms using a unified approach
   */
  async findOrCreateUser(platformUserId: string, platform: string, userInfo?: Message['userInfo']): Promise<UnifiedUser> {
    try {
      // For now, we'll use the WhatsAppUser model for all platforms
      // In the future, this could be refactored to use a unified User model
      const user = await prisma.whatsAppUser.upsert({
        where: { waId: `${platform}:${platformUserId}` }, // Prefix with platform to avoid conflicts
        update: {
          name: userInfo?.firstName || userInfo?.username || 'Unknown',
        },
        create: {
          waId: `${platform}:${platformUserId}`,
          name: userInfo?.firstName || userInfo?.username || 'Unknown',
          phone: platformUserId, // Store the platform user ID as phone for now
        },
      });

      return {
        id: user.id,
        name: user.name || undefined,
        platform,
        platformUserId,
        phone: user.phone || undefined,
        lastLocation: user.lastLocation,
      };
    } catch (error) {
      logger.error('Error finding or creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: Partial<UnifiedUser>): Promise<void> {
    try {
      await prisma.whatsAppUser.update({
        where: { id: userId },
        data: {
          name: updates.name,
          phone: updates.phone,
          lastLocation: updates.lastLocation,
        },
      });
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }
}
