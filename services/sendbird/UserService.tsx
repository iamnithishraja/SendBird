// services/UserService.tsx
import { User } from '@sendbird/chat';
import { ChannelService } from './ChannelService';

const GENERAL_CHAT_URL = 'general_chat';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getAllUsers(): Promise<User[] | null> {
    try {
      const channel = await ChannelService.getInstance().getChannel(GENERAL_CHAT_URL);
      if (!channel) {
        console.error('General chat channel not found');
        return [];
      }
      
      const users = channel.members;
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}