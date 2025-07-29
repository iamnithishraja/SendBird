// services/ChannelService.tsx
import { GroupChannel, GroupChannelListOrder } from '@sendbird/chat/groupChannel';
import * as Crypto from 'expo-crypto';
import { UserService } from './UserService';

const GENERAL_CHAT_URL = 'general_chat';

type SendBirdWithModules = any; // Use the same type as in ConnectionService

export class ChannelService {
  private static instance: ChannelService;
  private sb: SendBirdWithModules | null = null;
  private currentUser: any = null;

  private constructor() {}

  static getInstance(): ChannelService {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }
    return ChannelService.instance;
  }

  setSendBirdInstance(sb: SendBirdWithModules, currentUser: any) {
    this.sb = sb;
    this.currentUser = currentUser;
  }

  async getChannels(): Promise<GroupChannel[]> {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      const channelListQuery = this.sb.groupChannel.createMyGroupChannelListQuery({
        includeEmpty: true,
        limit: 20,
        order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
      });

      const channels = await channelListQuery.next();
      return channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  }

  async getChannel(channelUrl: string): Promise<GroupChannel | null> {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      const channel = await this.sb.groupChannel.getChannel(channelUrl);
      return channel;
    } catch (error) {
      console.error('Error getting channel:', error);
      return null;
    }
  }

  async joinOrCreateGeneralChat(): Promise<GroupChannel | null> {
    if (!this.sb || !this.currentUser) {
      throw new Error('SendBird not initialized');
    }

    try {
      try {
        const channel = await this.sb.groupChannel.getChannel(GENERAL_CHAT_URL);
        
        const isMember = channel.members.some(
          (member: any) => member.userId === this.currentUser.userId
        );
        
        if (!isMember) {
          await channel.join();
          console.log('Joined general chat');
        }
        
        return channel;
      } catch (error) {
        console.log('General chat not found, creating...');
        return await this.createGeneralChat();
      }
    } catch (error) {
      console.error('Error joining or creating general chat:', error);
      return null;
    }
  }

  async createGeneralChat(): Promise<GroupChannel | null> {
    if (!this.sb || !this.currentUser) {
      throw new Error('SendBird not initialized');
    }

    try {
      const params = {
        name: 'General Chat',
        channelUrl: GENERAL_CHAT_URL,
        isPublic: true,
        isDistinct: false,
        operatorUserIds: [this.currentUser.userId],
        coverUrl: '',
        data: JSON.stringify({ isDefault: true }),
      };

      const channel = await this.sb.groupChannel.createChannel(params);
      console.log('General chat created:', channel.name);
      return channel;
    } catch (error: any) {
      console.error('Error creating general chat:', error);
      
      if (error.message && error.message.includes('unique constraint')) {
        console.log('General chat already exists, trying to join...');
        try {
          const channel = await this.sb.groupChannel.getChannel(GENERAL_CHAT_URL);
          await channel.join();
          return channel;
        } catch (innerError) {
          console.error('Error joining existing general chat:', innerError);
        }
      }
      
      return null;
    }
  }

  async acceptAllPendingInvitations(): Promise<void> {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      const invitationListQuery = this.sb.groupChannel.createMyGroupChannelListQuery();
      console.log("invitationListQuery", invitationListQuery);
      if (invitationListQuery.hasNext) {
        const invitedChannels = await invitationListQuery.next();
        
        for (const channel of invitedChannels) {
          try {
            await channel.acceptInvitation();
            console.log(`Accepted invitation for channel: ${channel.url}`);
          } catch (error) {
            console.error(`Error accepting invitation for channel ${channel.url}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error accepting pending invitations:', error);
    }
  }

  async joinOrCreateOneToOneChats(): Promise<void> {
    if (!this.sb || !this.currentUser) {
      throw new Error('SendBird not initialized');
    }
  
    await this.acceptAllPendingInvitations();

    try {
      const users = await UserService.getInstance().getAllUsers();
      if (!users) {
        throw new Error('No users found');
      }
  
      for (const user of users) {
        if (user.userId === this.currentUser.userId) {
          continue;
        }
  
        const sortedUserIds = [user.userId, this.currentUser.userId].sort();
        const channelUrl = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256, 
          `${sortedUserIds[0]}_${sortedUserIds[1]}`
        );
  
        try {
          const channel = await this.sb.groupChannel.getChannel(channelUrl);
          
          const isMember = channel.members.some(
            (member: any) => member.userId === this.currentUser.userId
          );
          
          if (!isMember) {
            console.log(`Channel exists with ${user.userId} but not a member, skipping for now...`);
            continue;
          } else {
            console.log(`Already a member of chat with ${user.userId}`);
          }
        } catch (getChannelError) {
          console.log(`One-to-one chat not found with ${user.userId}, creating...`);
          try {
            const channel = await this.sb.groupChannel.createChannel({
              channelUrl,
              isDistinct: true,
              isPublic: false,
              isSuper: false,
              name: `${user.nickname || user.userId} & ${this.currentUser.nickname || this.currentUser.userId}`,
              operatorUserIds: [this.currentUser.userId, user.userId],
            });
            
            try {
              await channel.invite([user]);
              console.log(`Created channel and invited ${user.userId}`);
            } catch (inviteError) {
              console.error(`Error inviting ${user.userId} to new channel:`, inviteError);
            }
            
          } catch (createError: any) {
            if (createError.message && (
              createError.message.includes('violates unique constraint') ||
              createError.message.includes('already exists') ||
              createError.code === 400201
            )) {
              console.log(`Channel already exists with ${user.userId}, will be handled by invitation acceptance`);
              continue;
            } else {
              console.error(`Error creating channel with ${user.userId}:`, createError);
            }
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error in joinOrCreateOneToOneChats:', error);
      throw error;
    }
  }
}