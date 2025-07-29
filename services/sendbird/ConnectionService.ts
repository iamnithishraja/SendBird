// services/ConnectionService.tsx
import SendBird, { UserUpdateParams } from '@sendbird/chat';
import { GroupChannelModule } from '@sendbird/chat/groupChannel';
import { ChannelService } from './ChannelService';
import { HandlerService } from './HandlerService';

const SENDBIRD_APP_ID = 'DC052E8D-9037-4617-BA99-2CFD341E8B79';

type SendBirdWithModules = SendBird & {
  groupChannel: GroupChannelModule;
};

export class ConnectionService {
  private static instance: ConnectionService;
  private sb: SendBirdWithModules | null = null;
  private currentUser: any = null;

  private constructor() {}

  static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  async initialize(userId: string, userName: string) {
    try {
      if (!this.sb) {
        const sendbirdInstance = SendBird.init({
          appId: SENDBIRD_APP_ID,
          modules: [new GroupChannelModule()],
        });
        
        this.sb = sendbirdInstance as SendBirdWithModules;
      }

      const user = await this.sb.connect(userId);
      this.currentUser = user;

      await this.sb.updateCurrentUserInfo({
        nickname: userName,
      } as UserUpdateParams);

      console.log('SendBird initialized successfully');
      
      // Initialize handlers and channels
      HandlerService.getInstance().setSendBirdInstance(this.sb);
      HandlerService.getInstance().addInvitationHandler();
      HandlerService.getInstance().addGlobalChannelHandler();
      
      ChannelService.getInstance().setSendBirdInstance(this.sb, this.currentUser);
      await ChannelService.getInstance().joinOrCreateGeneralChat();
      await ChannelService.getInstance().joinOrCreateOneToOneChats();
      
      return user;
    } catch (error) {
      console.error('SendBird initialization error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.sb) {
      const handlerService = HandlerService.getInstance();
      handlerService.removeInvitationHandler();
      handlerService.removeGlobalChannelHandler();
      handlerService.removeChannelUpdateCallback();
      handlerService.clearAllChannelHandlers();
      
      await this.sb.disconnect();
      this.sb = null;
      this.currentUser = null;
    }
  }

  getInstance() {
    return this.sb;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getSendBirdInstance(): SendBirdWithModules | null {
    return this.sb;
  }

  getCurrentUserInfo() {
    return this.currentUser;
  }
}