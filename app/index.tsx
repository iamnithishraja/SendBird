import ChatListItem from '@/components/chat/ChatListItem';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthService, User } from '@/services/AuthService';
import { SendBirdService } from '@/services/SendBirdService';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      
      // Set up callback for real-time channel list updates
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

  const loadChannels = async () => {
    try {
      const channelList = await SendBirdService.getChannels();
      
      if (channelList.length === 0) {
        const generalChat = await SendBirdService.joinOrCreateGeneralChat();
        if (generalChat) {
          setChannels([generalChat]);
        }
      } else {
        // Sort channels by last message timestamp (most recent first)
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

  const handleChatPress = (channelUrl: string) => {
    router.push(`/chat/${channelUrl}`);
  };

  const renderChatItem = ({ item }: { item: GroupChannel }) => (
    <ChatListItem
      channel={item}
      onPress={() => handleChatPress(item.url)}
      isDark={isDark}
    />
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: isDark ? '#fff' : '#000' }]}>
          Welcome {user?.name}
        </Text>
        <TouchableOpacity onPress={() => {
          SendBirdService.removeChannelUpdateCallback();
          SendBirdService.disconnect();
          AuthService.clearStorage();
          router.replace('/credentials');
        }}>
          <Text style={[styles.headerText, { color: isDark ? '#007AFF' : '#007AFF' }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {channels.length > 0 ? (
          <FlatList
            data={channels}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.url}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? '#fff' : '#000'}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
              No chats available
            </Text>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#eee' }]}
              onPress={onRefresh}
            >
              <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {channels.length > 0 && (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
            {channels.length} chat{channels.length !== 1 ? 's' : ''} • Real-time updates
          </Text>
        </View>
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
  listContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});