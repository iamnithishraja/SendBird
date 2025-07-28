import MessageInput from '@/components/chat/MessageInput';
import MessageItem from '@/components/chat/MessageItem';
import ChatHeader from '@/components/common/ChatHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SendBirdService } from '@/services/SendBirdService';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { BaseMessage } from '@sendbird/chat/message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
    
    // Scroll to bottom on new message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  useEffect(() => {
    if (channelId) {
      initializeChat(channelId);
    } else {
      console.error('No channel ID provided');
      router.back();
    }
    
    return () => {
      // Clean up any listeners when component unmounts
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
      
      // We don't need to reverse the messages as they're already in chronological order
      setMessages(messageList);
      
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
    // Set up channel handler for real-time updates
    try {
      console.log('Setting up channel handler for channel:', channelData.url);
      // Add message handler for real-time updates
      const handlerId = SendBirdService.addChannelHandler(
        channelData.url,
        handleMessageReceived
      );
      
      // Store handler ID for cleanup
      handlerIdRef.current = handlerId;
      
      console.log('Channel handler set up with ID:', handlerId);
    } catch (error) {
      console.error('Error setting up channel handler:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!channel || !messageText.trim()) return;
  
    try {
      // Send the message and get the sent message object
      const sentMessage = await SendBirdService.sendMessage(channel.url, messageText);
      
      // Immediately add the sent message to the local state
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
    
    // If no name, create name from members
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
    />
  );

  // Safe key extractor that handles possible undefined messageId
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