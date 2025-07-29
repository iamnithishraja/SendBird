import MessageInput from '@/components/chat/MessageInput';
import MessageItem from '@/components/chat/MessageItem';
import ChatHeader from '@/components/common/ChatHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SendBirdService } from '@/services/SendBirdService';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { BaseMessage } from '@sendbird/chat/message';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const channelId = typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [channel, setChannel] = useState<GroupChannel | null>(null);
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const handlerIdRef = useRef<string>('');
  
  // Handler for new messages
  const handleMessageReceived = (message: BaseMessage) => {
    console.log('New message received:', message);
    setMessages(prevMessages => [...prevMessages, message]);
    
    // Mark messages as read when new message arrives and user is viewing the chat
    markMessagesAsRead();
    
    // Scroll to bottom on new message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (channel) {
      try {
        await channel.markAsRead();
        console.log('Messages marked as read');
        
        // Force re-render of messages to update read receipts
        setMessages(prevMessages => [...prevMessages]);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  }, [channel]);

  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      markMessagesAsRead();
    }, [markMessagesAsRead])
  );

  useEffect(() => {
    if (channelId) {
      initializeChat(channelId);
    } else {
      console.error('No channel ID provided');
      router.back();
    }
    
    return () => {
      if (channelId && handlerIdRef.current) {
        console.log('Removing channel handler on unmount');
        SendBirdService.removeChannelHandler(channelId);
      }
    };
  }, [channelId]);

  const initializeChat = async (channelUrl: string) => {
    try {
      const channelData = await SendBirdService.getChannel(channelUrl);
      if (!channelData) {
        console.error('Channel not found');
        Alert.alert('Error', 'Channel not found');
        router.back();
        return;
      }

      setChannel(channelData);
      
      // Load messages
      const messageList = await SendBirdService.getMessages(channelUrl);
      setMessages(messageList);
      
      // Mark messages as read when entering the channel
      await channelData.markAsRead();
      
      // Set up channel handler for real-time updates
      setupChannelHandler(channelData);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        if (flatListRef.current && messageList.length > 0) {
          flatListRef.current.scrollToEnd({ animated: false });
        }
      }, 300);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to initialize chat');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const setupChannelHandler = (channelData: GroupChannel) => {
    try {
      console.log('Setting up channel handler for channel:', channelData.url);
      const handlerId = SendBirdService.addChannelHandler(
        channelData.url,
        handleMessageReceived
      );
      
      handlerIdRef.current = handlerId;
      console.log('Channel handler set up with ID:', handlerId);
    } catch (error) {
      console.error('Error setting up channel handler:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!channel || !messageText.trim()) return;
  
    try {
      const sentMessage = await SendBirdService.sendMessage(channel.url, messageText);
      
      if (sentMessage) {
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        
        // Scroll to bottom after sending
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
  
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
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

  const renderMessage = ({ item, index }: { item: BaseMessage; index: number }) => (
    <MessageItem 
      message={item} 
      isDark={isDark}
      isLastMessage={index === messages.length - 1}
      channel={channel} // Pass channel for read receipt calculation
    />
  );

  const keyExtractor = (item: BaseMessage) => {
    return item.messageId ? item.messageId.toString() : `msg-${Date.now()}-${Math.random()}`;
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!channel) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
            Chat not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <ChatHeader 
        title={getChannelName()}
        memberCount={channel.memberCount}
        onBackPress={() => router.back()}
        isDark={isDark}
      />
      
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          onScrollEndDrag={markMessagesAsRead} // Mark as read when user scrolls
        />
        
        <MessageInput
          onSendMessage={sendMessage}
          isDark={isDark}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});

export default ChatScreen;