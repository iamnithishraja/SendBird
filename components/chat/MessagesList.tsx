import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { BaseMessage } from '@sendbird/chat/message';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import MessageItem from '@/components/chat/MessageItem';

interface MessagesListProps {
  messages: BaseMessage[];
  channel: GroupChannel;
  onMarkAsRead: () => void;
  isDark: boolean;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  channel,
  onMarkAsRead,
  isDark
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item, index }: { item: BaseMessage; index: number }) => (
    <MessageItem 
      message={item} 
      isDark={isDark}
      isLastMessage={index === messages.length - 1}
      channel={channel}
    />
  );

  const keyExtractor = (item: BaseMessage) => {
    // Always use messageId as the key if available
    if (item.messageId) {
      return `msg-${item.messageId}`;
    }
    
    // For messages without an ID, create a stable key based on content and sender
    // This is a fallback and should rarely be used
    const senderId = item.sender ? item.sender.userId : 'unknown';
    const content = 'message' in item ? item.message : 'unknown-content';
    const timestamp = item.createdAt || Date.now();
    
    return `msg-${senderId}-${content}-${timestamp}`;
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      style={styles.messagesList}
      contentContainerStyle={[
        styles.messagesContainer,
        messages.length === 0 && styles.emptyList
      ]}
      showsVerticalScrollIndicator={false}
      inverted={false}
      onContentSizeChange={() => {
        if (flatListRef.current && messages.length > 0) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      }}
      onScrollEndDrag={onMarkAsRead}
    />
  );
};

const styles = StyleSheet.create({
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagesList;