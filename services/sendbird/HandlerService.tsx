// services/HandlerService.tsx
import { BaseChannel, User } from '@sendbird/chat';
import { GroupChannel, GroupChannelHandler } from '@sendbird/chat/groupChannel';
import { BaseMessage } from '@sendbird/chat/message';
import { ChannelService } from './ChannelService';

type SendBirdWithModules = any; // Use the same type as in ConnectionService
type MessageHandler = (message: BaseMessage) => void;

export class HandlerService {
  private static instance: HandlerService;
  private sb: SendBirdWithModules | null = null;
  private channelHandlers: Map<string, string> = new Map();
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private invitationHandlerId: string | null = null;
  private channelUpdateCallback: (() => void) | null = null;
  private globalChannelHandlerId: string | null = null;

  private constructor() {}

  static getInstance(): HandlerService {
    if (!HandlerService.instance) {
      HandlerService.instance = new HandlerService();
    }
    return HandlerService.instance;
  }

  setSendBirdInstance(sb: SendBirdWithModules) {
    this.sb = sb;
  }

  addGlobalChannelHandler() {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      this.globalChannelHandlerId = `global_channel_handler_${Date.now()}`;
      
      const globalChannelHandler: GroupChannelHandler = new GroupChannelHandler({
        onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
          console.log(`Global handler: Message received in channel ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        },
        
        onMessageUpdated: (channel: BaseChannel, message: BaseMessage) => {
          console.log(`Global handler: Message updated in channel ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        },
        
        onMessageDeleted: (channel: BaseChannel, messageId: number) => {
          console.log(`Global handler: Message deleted in channel ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        },
        
        onChannelChanged: (channel: BaseChannel) => {
          console.log(`Global handler: Channel changed ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        },
        
        onUserJoined: (channel: GroupChannel, user: User) => {
          console.log(`Global handler: User joined channel ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        },
        
        onUserLeft: (channel: GroupChannel, user: User) => {
          console.log(`Global handler: User left channel ${channel.url}`);
          if (this.channelUpdateCallback) {
            this.channelUpdateCallback();
          }
        }
      });
      
      this.sb.groupChannel.addGroupChannelHandler(this.globalChannelHandlerId, globalChannelHandler);
      console.log(`Added global channel handler with ID: ${this.globalChannelHandlerId}`);
      
    } catch (error) {
      console.error('Error adding global channel handler:', error);
    }
  }

  removeGlobalChannelHandler() {
    if (!this.sb || !this.globalChannelHandlerId) {
      return;
    }

    try {
      this.sb.groupChannel.removeGroupChannelHandler(this.globalChannelHandlerId);
      console.log(`Removed global channel handler with ID: ${this.globalChannelHandlerId}`);
      this.globalChannelHandlerId = null;
    } catch (error) {
      console.error('Error removing global channel handler:', error);
    }
  }

  setChannelUpdateCallback(callback: () => void) {
    this.channelUpdateCallback = callback;
  }

  removeChannelUpdateCallback() {
    this.channelUpdateCallback = null;
  }

  addInvitationHandler() {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      this.invitationHandlerId = `invitation_handler_${Date.now()}`;
      
      const groupChannelHandler: GroupChannelHandler = new GroupChannelHandler({
        onUserReceivedInvitation: (channel: GroupChannel, inviter: User | null, invitees: User[]) => {
          const inviterName = inviter ? (inviter.nickname || inviter.userId) : 'Unknown';
          console.log(`Received invitation to channel: ${channel.url} from ${inviterName}`);
          
          ChannelService.getInstance().acceptAllPendingInvitations()
            .then(() => {
              console.log('Auto-accepted all pending invitations');
              if (this.channelUpdateCallback) {
                this.channelUpdateCallback();
              }
            })
            .catch((error) => {
              console.error('Error auto-accepting pending invitations:', error);
            });
        },
        
        onUserDeclinedInvitation: (channel: GroupChannel, invitee: User, inviter: User | null) => {
          const inviterName = inviter ? (inviter.nickname || inviter.userId) : 'Unknown';
          console.log(`User ${invitee.nickname || invitee.userId} declined invitation to channel: ${channel.url} from ${inviterName}`);
        }
      });
      
      this.sb.groupChannel.addGroupChannelHandler(this.invitationHandlerId, groupChannelHandler);
      console.log(`Added invitation handler with ID: ${this.invitationHandlerId}`);
      
    } catch (error) {
      console.error('Error adding invitation handler:', error);
    }
  }

  removeInvitationHandler() {
    if (!this.sb || !this.invitationHandlerId) {
      return;
    }

    try {
      this.sb.groupChannel.removeGroupChannelHandler(this.invitationHandlerId);
      console.log(`Removed invitation handler with ID: ${this.invitationHandlerId}`);
      this.invitationHandlerId = null;
    } catch (error) {
      console.error('Error removing invitation handler:', error);
    }
  }

  addChannelHandler(channelUrl: string, onMessageReceived: MessageHandler): string {
    if (!this.sb) {
      throw new Error('SendBird not initialized');
    }

    try {
      const handlerId = `handler_${channelUrl}_${Date.now()}`;
      
      const groupChannelHandler: GroupChannelHandler = new GroupChannelHandler({
        onMessageReceived: (channel: BaseChannel, message: BaseMessage) => {
          if (channel.url === channelUrl) {
            onMessageReceived(message);
          }
        }
      });
      
      this.sb.groupChannel.addGroupChannelHandler(handlerId, groupChannelHandler);
      
      this.channelHandlers.set(channelUrl, handlerId);
      this.messageHandlers.set(channelUrl, onMessageReceived);
      
      console.log(`Added channel handler for ${channelUrl} with ID: ${handlerId}`);
      return handlerId;
      
    } catch (error) {
      console.error('Error adding channel handler:', error);
      return '';
    }
  }

  removeChannelHandler(channelUrl: string) {
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

  clearAllChannelHandlers() {
    if (!this.sb) {
      return;
    }

    for (const [channelUrl, handlerId] of this.channelHandlers.entries()) {
      this.sb.groupChannel.removeGroupChannelHandler(handlerId);
    }
    this.channelHandlers.clear();
    this.messageHandlers.clear();
  }
}