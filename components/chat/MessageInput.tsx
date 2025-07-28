import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isDark: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isDark }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
        borderTopColor: isDark ? '#333' : '#e0e0e0'
      }
    ]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            { 
              backgroundColor: isDark ? '#2a2a2a' : '#fff',
              color: isDark ? '#fff' : '#000',
              borderColor: isDark ? '#444' : '#ddd'
            }
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={isDark ? '#999' : '#999'}
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: message.trim() ? 1 : 0.5 }
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageInput;