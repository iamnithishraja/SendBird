import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ChatHeaderProps {
  title: string;
  memberCount: number;
  onBackPress: () => void;
  isDark: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, memberCount, onBackPress, isDark }) => {
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? '#1a1a1a' : '#f8f9fa',
        borderBottomColor: isDark ? '#333' : '#e0e0e0'
      }
    ]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.backButtonText, { color: isDark ? '#007AFF' : '#007AFF' }]}>
          ← Back
        </Text>
      </TouchableOpacity>
      
      <View style={styles.titleContainer}>
        <Text 
          style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#999' : '#666' }]}>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>
      </View>
      
      <View style={styles.rightSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  rightSpace: {
    width: 60, // Balance the back button space
  },
});

export default ChatHeader;