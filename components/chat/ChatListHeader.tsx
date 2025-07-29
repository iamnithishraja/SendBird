import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ChatListHeaderProps {
  userName?: string;
  onLogout: () => void;
  isDark: boolean;
}

const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  userName,
  onLogout,
  isDark
}) => {
  return (
    <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#eee' }]}>
      <Text style={[styles.headerText, { color: isDark ? '#fff' : '#000' }]}>
        Welcome {userName}
      </Text>
      <TouchableOpacity onPress={onLogout}>
        <Text style={[styles.logoutText, { color: '#007AFF' }]}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatListHeader;