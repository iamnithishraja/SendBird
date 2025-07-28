import { SendBirdService } from '@/services/SendBirdService';
import { BaseMessage, Sender, UserMessage } from '@sendbird/chat/message';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface MessageItemProps {
  message: BaseMessage;
  isDark: boolean;
  isLastMessage: boolean;
}

// Type guard to check if message is a UserMessage
function isUserMessage(message: BaseMessage): message is UserMessage {
  return message.messageType === 'user';
}

// Extended BaseMessage interface with sender property
interface MessageWithSender extends BaseMessage {
  sender?: Sender;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isDark, isLastMessage }) => {
  const currentUser = SendBirdService.getCurrentUser();
  // Cast message to include sender property
  const messageWithSender = message as MessageWithSender;
  const isMyMessage = messageWithSender.sender?.userId === currentUser?.userId;
  
  const getMessageText = () => {
    if (isUserMessage(message)) {
      return message.message || 'Message';
    }
    return 'File message';
  };

  const formatTime = () => {
    const date = new Date(message.createdAt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = () => {
    if (isMyMessage) return 'You';
    return messageWithSender.sender?.nickname || messageWithSender.sender?.userId || 'Unknown';
  };

  const getInitial = () => {
    const name = getSenderName();
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      isLastMessage && styles.lastMessage
    ]}>
      {!isMyMessage && (
        <View style={styles.senderInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitial()}
            </Text>
          </View>
          <View style={styles.messageContent}>
            <Text style={[styles.senderName, { color: isDark ? '#ccc' : '#666' }]}>
              {getSenderName()}
            </Text>
            <View style={[
              styles.messageBubble,
              { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }
            ]}>
              <Text style={[styles.messageText, { color: isDark ? '#fff' : '#000' }]}>
                {getMessageText()}
              </Text>
            </View>
            <Text style={[styles.timeText, { color: isDark ? '#999' : '#999' }]}>
              {formatTime()}
            </Text>
          </View>
        </View>
      )}
      
      {isMyMessage && (
        <View style={styles.myMessageContent}>
          <View style={[styles.messageBubble, styles.myMessageBubble]}>
            <Text style={styles.myMessageText}>
              {getMessageText()}
            </Text>
          </View>
          <Text style={[styles.timeText, styles.myTimeText, { color: isDark ? '#999' : '#999' }]}>
            {formatTime()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  lastMessage: {
    marginBottom: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '80%',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  myMessageContent: {
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 4,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
  },
  myTimeText: {
    textAlign: 'right',
  },
});

export default MessageItem;