import SendBird, { BaseChannel, UserUpdateParams } from '@sendbird/chat';
import { GroupChannel, GroupChannelListOrder, GroupChannelModule } from '@sendbird/chat/groupChannel';
import { BaseMessage, UserMessageCreateParams } from '@sendbird/chat/message';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';

const SENDBIRD_APP_ID = 'DC052E8D-9037-4617-BA99-2CFD341E8B79'; // Replace with your actual SendBird App ID
const GENERAL_CHAT_URL = 'general_chat';

// Define a type that includes the groupChannel property
type SendBirdWithModules = SendBird & {
  groupChannel: GroupChannelModule;
};

// Message handler type
type MessageHandler = (message: BaseMessage) => void;

export class SendBirdService {
  private static sb: SendBirdWithModules | null = null;
  private static currentUser: any = null;
  private static channelHandlers: Map<string, string> = new Map();
  private static messageHandlers: Map<string, MessageHandler> = new Map();

  static async initialize(userId: string, userName: string) {
    try {
      if (!this.sb) {
        const sendbirdInstance = SendBird.init({
          appId: SENDBIRD_APP_ID,
          modules: [new GroupChannelModule()],
        });
        
        // Cast to our extended type
        this.sb = sendbirdInstance as SendBirdWithModules;
      }

      // Connect user
      const user = await this.sb.connect(userId);
      this.currentUser = user;

      // Update user profile
      await this.sb.updateCurrentUserInfo({
        nickname: userName,
      } as UserUpdateParams);

      console.log('SendBird initialized successfully');
      
      // Try to join or create the general chat
      await this.joinOrCreateGeneralChat();
      
      return user;
    } catch (error) {
      console.error('SendBird initialization error:', error);
      throw error;
    }
  }

  static async joinOrCreateGeneralChat(): Promise<GroupChannel | null> {
    if (!this.sb || !this.currentUser) {
      throw new Error('SendBird not initialized');
    }

    try {
      // First try to get the general chat
      try {
        const channel = await this.sb.groupChannel.getChannel(GENERAL_CHAT_URL);
        
        // Check if current user is already a member
        const isMember = channel.members.some(
          (member: any) => member.userId === this.currentUser.userId
        );
        
        // If not a member, join the channel
        if (!isMember) {
          await channel.join();
          console.log('Joined general chat');
        }
        
        return channel;
      } catch (error) {
        // Channel doesn't exist, create it
        console.log('General chat not found, creating...');
        return await this.createGeneralChat();
      }
    } catch (error) {
      console.error('Error joining or creating general chat:', error);
      return null;
    }
  }

  static async getChannels(): Promise<GroupChannel[]> {
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

  static async createGeneralChat(): Promise<GroupChannel | null> {
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
      
      // If error is due to channel already existing, try to get it
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

  static async getChannel(channelUrl: string): Promise<GroupChannel | null> {
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

  static async sendMessage(channelUrl: string, message: string): Promise<BaseMessage> {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }
  
    try {
      const channel = await this.getChannel(channelUrl);
      console.log("channel", channel, channelUrl);
      if (!channel) {
        throw new Error('Channel not found');
      }
  
      const params: UserMessageCreateParams = {
        message: message,
      };
  
      // Wrap the callback-based API in a Promise
      return new Promise((resolve, reject) => {
        channel.sendUserMessage(params)
          .onSucceeded((message: BaseMessage) => {
            console.log("sentMessage", message);
            resolve(message);
          })
          .onFailed((error: any) => {
            console.error("Failed to send message:", error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getMessages(channelUrl: string, limit: number = 20) {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      const channel = await this.getChannel(channelUrl);
      if (!channel) {
        throw new Error('Channel not found');
      }

      const messageListQuery = channel.createPreviousMessageListQuery({
        limit: limit,
        reverse: false,
        includeReactions: true,
      });

      const messages = await messageListQuery.load();
      return messages;
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Add a message handler for real-time updates
// Add a message handler for real-time updates
static addChannelHandler(channelUrl: string, onMessageReceived: MessageHandler): string {
  if (!this.sb) {
    throw new Error('SendBird not initialized');
  }

  try {
    // Create a unique handler ID
    const handlerId = `handler_${channelUrl}_${Date.now()}`;
    
    const groupChannelHandler: GroupChannelHandler = new GroupChannelHandler({
      onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
        // Only handle messages for the specific channel
        if (channel.url === channelUrl) {
          onMessageReceived(message);
        }
      }
    });
    
    // Add the handler with the unique ID
    this.sb.groupChannel.addGroupChannelHandler(handlerId, groupChannelHandler);
    
    // Store the handler ID for cleanup
    this.channelHandlers.set(channelUrl, handlerId);
    this.messageHandlers.set(channelUrl, onMessageReceived);
    
    console.log(`Added channel handler for ${channelUrl} with ID: ${handlerId}`);
    return handlerId;
    
  } catch (error) {
    console.error('Error adding channel handler:', error);
    return '';
  }
}

// Remove a message handler
static removeChannelHandler(channelUrl: string) {
  if (!this.sb) {
    return;
  }

  try {
    const handlerId = this.channelHandlers.get(channelUrl);
    if (handlerId) {
      this.sb.groupChannel.removeGroupChannelHandler(handlerId);
      this.channelHandlers.delete(channelUrl);
      this.messageHandlers.delete(channelUrl);
      console.log(`Removed channel handler for ${channelUrl} with ID: ${handlerId}`);
    } else {
      console.log(`No handler found for channel: ${channelUrl}`);
    }
  } catch (error) {
    console.error('Error removing channel handler:', error);
  }
}

  static async disconnect() {
    if (this.sb) {
      // Remove all channel handlers
      for (const [channelUrl, handlerId] of this.channelHandlers.entries()) {
        this.sb.groupChannel.removeGroupChannelHandler(handlerId);
      }
      this.channelHandlers.clear();
      this.messageHandlers.clear();
      
      await this.sb.disconnect();
      this.sb = null;
      this.currentUser = null;
    }
  }

  static getInstance() {
    return this.sb;
  }

  static getCurrentUser() {
    return this.currentUser;
  }
}