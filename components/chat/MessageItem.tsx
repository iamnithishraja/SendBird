import { SendBirdService } from '@/services/SendBirdService';
import { BaseMessage, Sender, UserMessage } from '@sendbird/chat/message';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageItemProps {
  message: BaseMessage;
  isDark: boolean;
  isLastMessage: boolean;
  channel?: GroupChannel; // Add channel prop to get read status
}

// Type guard to check if message is a UserMessage
function isUserMessage(message: BaseMessage): message is UserMessage {
  return message.messageType === 'user';
}

// Extended BaseMessage interface with sender property
interface MessageWithSender extends BaseMessage {
  sender?: Sender;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isDark, 
  isLastMessage, 
  channel 
}) => {
  const currentUser = SendBirdService.getCurrentUser();
  const messageWithSender = message as MessageWithSender;
  const isMyMessage = messageWithSender.sender?.userId === currentUser?.userId;
  
  // State for read receipt status
  const [readStatus, setReadStatus] = useState<{
    isRead: boolean;
    isDelivered: boolean;
    unreadCount: number;
  }>({
    isRead: false,
    isDelivered: false,
    unreadCount: 0
  });

  // Calculate read status when component mounts or message/channel changes
  useEffect(() => {
    if (isMyMessage && channel && message.sendingStatus === 'succeeded') {
      calculateReadStatus();
    }
  }, [message, channel, isMyMessage]);

  const calculateReadStatus = () => {
    if (!channel || !isMyMessage) return;

    try {
      // Get unread member count for this message
      const unreadCount = channel.getUnreadMemberCount ? 
        channel.getUnreadMemberCount(message) : 0;
      
      // Message is read by all if unread count is 0
      const isRead = unreadCount === 0;
      
      // For delivery status, we can check if message was sent successfully
      // In a real implementation, you might want to track delivery separately
      const isDelivered = message.sendingStatus === 'succeeded';

      setReadStatus({
        isRead,
        isDelivered,
        unreadCount
      });
    } catch (error) {
      console.error('Error calculating read status:', error);
    }
  };

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

  // Render read receipt indicator for sent messages
  const renderReadReceipt = () => {
    if (!isMyMessage || message.sendingStatus !== 'succeeded') {
      return null;
    }

    // Show different states based on read status
    if (readStatus.isRead) {
      // All members have read the message - blue double tick
      return (
        <View style={styles.readReceiptContainer}>
          <Ionicons 
            name="checkmark-done" 
            size={14} 
            color="#007AFF" 
            style={styles.readReceiptIcon}
          />
        </View>
      );
    } else if (readStatus.isDelivered) {
      // Message delivered but not read by all - gray double tick
      return (
        <View style={styles.readReceiptContainer}>
          <Ionicons 
            name="checkmark-done" 
            size={14} 
            color={isDark ? '#666' : '#999'} 
            style={styles.readReceiptIcon}
          />
          {readStatus.unreadCount > 0 && (
            <Text style={[styles.unreadCountText, { color: isDark ? '#666' : '#999' }]}>
              {readStatus.unreadCount}
            </Text>
          )}
        </View>
      );
    } else {
      // Message sending or failed - single tick
      return (
        <View style={styles.readReceiptContainer}>
          <Ionicons 
            name="checkmark" 
            size={14} 
            color={isDark ? '#666' : '#999'} 
            style={styles.readReceiptIcon}
          />
        </View>
      );
    }
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
          <View style={styles.myMessageFooter}>
            <Text style={[styles.timeText, styles.myTimeText, { color: isDark ? '#999' : '#999' }]}>
              {formatTime()}
            </Text>
            {renderReadReceipt()}
          </View>
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
  myMessageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  readReceiptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readReceiptIcon: {
    marginLeft: 2,
  },
  unreadCountText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
});

export default MessageItem;