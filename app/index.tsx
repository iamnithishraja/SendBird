import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { GroupChannel } from '@sendbird/chat/groupChannel';

import LoadingIndicator from '@/components/common/LoadingIndicator';
import ChatHeader from '@/components/chat/ChatListHeader';
import ChatList from '@/components/chat/ChatList';
import EmptyState from '@/components/chat/EmptyState';
import FooterStats from '@/components/chat/FooterStats';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthService, User } from '@/services/AuthService';
import { SendBirdService } from '@/services/SendBirdService';
import { useChatChannels } from '@/hooks/useChatChannels';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const {
    channels,
    refreshing,
    loadChannels,
    onRefresh
  } = useChatChannels();

  useEffect(() => {
    initializeApp();
    
    return () => {
      SendBirdService.removeChannelUpdateCallback();
    };
  }, []);

  const initializeApp = async () => {
    try {
      const userData = await AuthService.getUser();
      if (!userData) {
        router.replace('/credentials');
        return;
      }
      setUser(userData);

      await SendBirdService.initialize(userData.id, userData.name);
      
      SendBirdService.setChannelUpdateCallback(() => {
        console.log('Channel update triggered, refreshing channels list...');
        loadChannels();
      });
      
      await loadChannels();
    } catch (error) {
      console.error('Error initializing app:', error);
      router.replace('/credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    SendBirdService.removeChannelUpdateCallback();
    SendBirdService.disconnect();
    AuthService.clearStorage();
    router.replace('/credentials');
  };

  const handleChatPress = (channelUrl: string) => {
    router.push(`/chat/${channelUrl}`);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ChatHeader
        userName={user?.name}
        onLogout={handleLogout}
        isDark={isDark}
      />
      
      <View style={styles.content}>
        {channels.length > 0 ? (
          <ChatList
            channels={channels}
            onChatPress={handleChatPress}
            refreshing={refreshing}
            onRefresh={onRefresh}
            isDark={isDark}
          />
        ) : (
          <EmptyState
            onRefresh={onRefresh}
            isDark={isDark}
          />
        )}
      </View>
      
      {channels.length > 0 && (
        <FooterStats
          channelCount={channels.length}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});