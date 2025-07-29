import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { BaseMessage } from '@sendbird/chat/message';
import { SendBirdService } from '@/services/SendBirdService';

export const useChatChannel = (channelId: string, router: any) => {
  const [channel, setChannel] = useState<GroupChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const handlerIdRef = useRef<string>('');

  const initializeChat = async (messageHandler: (message: BaseMessage) => void) => {
    try {
      const channelData = await SendBirdService.getChannel(channelId);
      if (!channelData) {
        console.error('Channel not found');
        Alert.alert('Error', 'Channel not found');
        router.back();
        return;
      }

      setChannel(channelData);
      
      await channelData.markAsRead();
      
      setupChannelHandler(channelData, messageHandler);
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const setupChannelHandler = (channelData: GroupChannel, messageHandler: (message: BaseMessage) => void) => {
    try {
      console.log('Setting up channel handler for channel:', channelData.url);
      const handlerId = SendBirdService.addChannelHandler(
        channelData.url,
        messageHandler
      );
      
      handlerIdRef.current = handlerId;
      console.log('Channel handler set up with ID:', handlerId);
    } catch (error) {
      console.error('Error setting up channel handler:', error);
    }
  };

  const getChannelName = () => {
    if (!channel) return 'Chat';
    
    if (channel.name && channel.name.trim()) {
      return channel.name;
    }
    
    const memberNames = channel.members
      .map(member => member.nickname || member.userId)
      .join(', ');
    
    return memberNames || 'Unnamed Chat';
  };

  return {
    channel,
    loading,
    initializeChat,
    getChannelName
  };
};
