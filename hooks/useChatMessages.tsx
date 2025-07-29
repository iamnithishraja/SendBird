import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { BaseMessage } from '@sendbird/chat/message';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { SendBirdService } from '@/services/SendBirdService';

export const useChatMessages = (channel: GroupChannel | null) => {
  const [messages, setMessages] = useState<BaseMessage[]>([]);

  const handleMessageReceived = (message: BaseMessage) => {
    console.log('New message received:', message);
    // Check if message already exists in the array to prevent duplicates
    setMessages(prevMessages => {
      // Check if a message with this ID already exists
      const messageExists = prevMessages.some(msg => msg.messageId === message.messageId);
      if (messageExists) {
        console.log('Message already exists, not adding duplicate');
        return prevMessages; // Return the existing array without changes
      }
      return [...prevMessages, message]; // Add the new message
    });
    markMessagesAsRead();
  };

  const markMessagesAsRead = useCallback(async () => {
    if (channel) {
      try {
        await channel.markAsRead();
        console.log('Messages marked as read');
        // Don't update the messages array here as it causes re-renders with same data
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  }, [channel]);

  const sendMessage = async (messageText: string) => {
    if (!channel || !messageText.trim()) return;

    try {
      const sentMessage = await SendBirdService.sendMessage(channel.url, messageText);
      
      if (sentMessage) {
        setMessages(prevMessages => {
          // Check if a message with this ID already exists
          const messageExists = prevMessages.some(msg => msg.messageId === sentMessage.messageId);
          if (messageExists) {
            console.log('Sent message already exists, not adding duplicate');
            return prevMessages; // Return the existing array without changes
          }
          return [...prevMessages, sentMessage]; // Add the new message
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const loadMessages = async (channelUrl: string) => {
    try {
      const messageList = await SendBirdService.getMessages(channelUrl);
      
      // Filter out duplicate messages by messageId
      const uniqueMessages = messageList.reduce((acc: BaseMessage[], current: BaseMessage) => {
        const isDuplicate = acc.some(item => item.messageId === current.messageId);
        if (!isDuplicate) {
          acc.push(current);
        } else {
          console.log('Filtered out duplicate message during load:', current.messageId);
        }
        return acc;
      }, []);
      
      setMessages(uniqueMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  return {
    messages,
    handleMessageReceived,
    sendMessage,
    markMessagesAsRead,
    loadMessages
  };
};