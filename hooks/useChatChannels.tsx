import { useState, useCallback } from 'react';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { SendBirdService } from '@/services/SendBirdService';

export const useChatChannels = () => {
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadChannels = async () => {
    try {
      const channelList = await SendBirdService.getChannels();
      
      if (channelList.length === 0) {
        const generalChat = await SendBirdService.joinOrCreateGeneralChat();
        if (generalChat) {
          setChannels([generalChat]);
        }
      } else {
        const sortedChannels = channelList.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.createdAt;
          const bTime = b.lastMessage?.createdAt || b.createdAt;
          return bTime - aTime;
        });
        setChannels(sortedChannels);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadChannels();
      console.log('Manual refresh completed');
    } catch (error) {
      console.error('Error during manual refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return {
    channels,
    refreshing,
    loadChannels,
    onRefresh
  };
};