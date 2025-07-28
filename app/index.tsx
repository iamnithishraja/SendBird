import ChatListItem from '@/components/chat/ChatListItem';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthService, User } from '@/services/AuthService';
import { SendBirdService } from '@/services/SendBirdService';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load user data
      const userData = await AuthService.getUser();
      if (!userData) {
        router.replace('/credentials');
        return;
      }
      setUser(userData);

      // Initialize SendBird and load channels
      await SendBirdService.initialize(userData.id, userData.name);
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
      // Get all channels
      const channelList = await SendBirdService.getChannels();
      
      // If no channels, the user might need to join the general chat
      if (channelList.length === 0) {
        const generalChat = await SendBirdService.joinOrCreateGeneralChat();
        if (generalChat) {
          setChannels([generalChat]);
        }
      } else {
        setChannels(channelList);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

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
      <View style={styles.content}>
        {channels.length > 0 ? (
          <FlatList
            data={channels}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.url}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
              No chats available
            </Text>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#eee' }]}
              onPress={loadChannels}
            >
              <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
});