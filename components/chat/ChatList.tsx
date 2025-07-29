import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import ChatListItem from '@/components/chat/ChatListItem';

interface ChatListProps {
  channels: GroupChannel[];
  onChatPress: (channelUrl: string) => void;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  isDark: boolean;
}

const ChatList: React.FC<ChatListProps> = ({
  channels,
  onChatPress,
  refreshing,
  onRefresh,
  isDark
}) => {
  const renderChatItem = ({ item }: { item: GroupChannel }) => (
    <ChatListItem
      channel={item}
      onPress={() => onChatPress(item.url)}
      isDark={isDark}
    />
  );

  return (
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
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default ChatList;