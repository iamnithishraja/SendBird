import MessageInput from '@/components/chat/MessageInput';
import MessagesList from '@/components/chat/MessagesList';
import ChatHeader from '@/components/common/ChatHeader';
import LoadingIndicator from '@/components/common/LoadingIndicator';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useChatChannel } from '@/hooks/useChatChannel';
import { useChatMessages } from '@/hooks/useChatMessages';
import { SendBirdService } from '@/services/SendBirdService';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useEffect, useCallback } from 'react';
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
  
  // Use the custom hooks
  const { channel, loading, initializeChat, getChannelName } = useChatChannel(channelId, router);
  const { messages, handleMessageReceived, sendMessage, markMessagesAsRead, loadMessages } = useChatMessages(channel);
  
  // Mark messages as read when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      markMessagesAsRead();
    }, [markMessagesAsRead])
  );

  useEffect(() => {
    if (channelId) {
      // Initialize chat and set up message handler
      initializeChat(handleMessageReceived);
    } else {
      console.error('No channel ID provided');
      router.back();
    }
    
    return () => {
      if (channelId) {
        console.log('Removing channel handler on unmount');
        SendBirdService.removeChannelHandler(channelId);
      }
    };
  }, [channelId]);
  
  // Separate effect to load messages only when channel is available
  useEffect(() => {
    if (channel) {
      console.log('Loading messages for channel:', channel.url);
      loadMessages(channel.url);
    }
  }, [channel?.url]); // Only depend on channel.url to prevent multiple loads

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
        <MessagesList
          messages={messages}
          channel={channel}
          onMarkAsRead={markMessagesAsRead}
          isDark={isDark}
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