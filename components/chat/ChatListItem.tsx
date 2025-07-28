import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GroupChannel } from '@sendbird/chat/groupChannel';

interface ChatListItemProps {
  channel: GroupChannel;
  onPress: () => void;
  isDark: boolean;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ channel, onPress, isDark }) => {
  const getChannelName = () => {
    if (channel.name && channel.name.trim()) {
      return channel.name;
    }
    
    // If no name, create name from members
    const memberNames = channel.members
      .map(member => member.nickname || member.userId)
      .join(', ');
    
    return memberNames || 'Unnamed Chat';
  };

  const getLastMessage = () => {
    if (!channel.lastMessage) {
      return 'No messages yet';
    }

    if (channel.lastMessage.messageType === 'user') {
      return (channel.lastMessage as any).message || 'Message';
    }
    
    return 'File message';
  };

  const formatTime = () => {
    if (!channel.lastMessage) {
      return '';
    }

    const date = new Date(channel.lastMessage.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const hasUnreadMessages = channel.unreadMessageCount > 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
          borderColor: isDark ? '#333' : '#e0e0e0' 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={[styles.avatarText, { color: isDark ? '#fff' : '#000' }]}>
          {getChannelName().charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[
              styles.name,
              { color: isDark ? '#fff' : '#000' },
              hasUnreadMessages && styles.boldText
            ]}
            numberOfLines={1}
          >
            {getChannelName()}
          </Text>
          <Text style={[styles.time, { color: isDark ? '#999' : '#666' }]}>
            {formatTime()}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              { color: isDark ? '#ccc' : '#666' },
              hasUnreadMessages && styles.boldText
            ]}
            numberOfLines={1}
          >
            {getLastMessage()}
          </Text>
          
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {channel.unreadMessageCount > 99 ? '99+' : channel.unreadMessageCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  boldText: {
    fontWeight: '600',
  },
});

export default ChatListItem;