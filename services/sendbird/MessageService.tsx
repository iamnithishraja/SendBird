// services/MessageService.tsx
import { BaseMessage, UserMessageCreateParams } from '@sendbird/chat/message';
import { ChannelService } from './ChannelService';

export class MessageService {
  private static instance: MessageService;

  private constructor() {}

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  async sendMessage(channelUrl: string, message: string): Promise<BaseMessage> {
    try {
      const channel = await ChannelService.getInstance().getChannel(channelUrl);
      console.log("channel", channel, channelUrl);
      if (!channel) {
        throw new Error('Channel not found');
      }
  
      const params: UserMessageCreateParams = {
        message: message,
      };
  
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

  async getMessages(channelUrl: string, limit: number = 20) {
    try {
      const channel = await ChannelService.getInstance().getChannel(channelUrl);
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
}