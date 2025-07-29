// SendBirdService.tsx - Main service that exports all functionality
import { ConnectionService } from './sendbird/ConnectionService';
import { ChannelService } from './sendbird/ChannelService';
import { MessageService } from './sendbird/MessageService';
import { HandlerService } from './sendbird/HandlerService';
import { UserService } from './sendbird/UserService';

// Export all the methods with the same interface
export class SendBirdService {
  // Connection methods
  static initialize = ConnectionService.getInstance().initialize.bind(ConnectionService.getInstance());
  static disconnect = ConnectionService.getInstance().disconnect.bind(ConnectionService.getInstance());
  static getInstance = ConnectionService.getInstance().getInstance.bind(ConnectionService.getInstance());
  static getCurrentUser = ConnectionService.getInstance().getCurrentUser.bind(ConnectionService.getInstance());

  // Channel methods
  static getChannels = ChannelService.getInstance().getChannels.bind(ChannelService.getInstance());
  static getChannel = ChannelService.getInstance().getChannel.bind(ChannelService.getInstance());
  static joinOrCreateGeneralChat = ChannelService.getInstance().joinOrCreateGeneralChat.bind(ChannelService.getInstance());
  static createGeneralChat = ChannelService.getInstance().createGeneralChat.bind(ChannelService.getInstance());
  static joinOrCreateOneToOneChats = ChannelService.getInstance().joinOrCreateOneToOneChats.bind(ChannelService.getInstance());
  static acceptAllPendingInvitations = ChannelService.getInstance().acceptAllPendingInvitations.bind(ChannelService.getInstance());

  // Message methods
  static sendMessage = MessageService.getInstance().sendMessage.bind(MessageService.getInstance());
  static getMessages = MessageService.getInstance().getMessages.bind(MessageService.getInstance());

  // Handler methods
  static addChannelHandler = HandlerService.getInstance().addChannelHandler.bind(HandlerService.getInstance());
  static removeChannelHandler = HandlerService.getInstance().removeChannelHandler.bind(HandlerService.getInstance());
  static addGlobalChannelHandler = HandlerService.getInstance().addGlobalChannelHandler.bind(HandlerService.getInstance());
  static removeGlobalChannelHandler = HandlerService.getInstance().removeGlobalChannelHandler.bind(HandlerService.getInstance());
  static addInvitationHandler = HandlerService.getInstance().addInvitationHandler.bind(HandlerService.getInstance());
  static removeInvitationHandler = HandlerService.getInstance().removeInvitationHandler.bind(HandlerService.getInstance());
  static setChannelUpdateCallback = HandlerService.getInstance().setChannelUpdateCallback.bind(HandlerService.getInstance());
  static removeChannelUpdateCallback = HandlerService.getInstance().removeChannelUpdateCallback.bind(HandlerService.getInstance());

  // User methods
  static getAllUsers = UserService.getInstance().getAllUsers.bind(UserService.getInstance());
}