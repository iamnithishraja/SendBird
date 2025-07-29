import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EmptyStateProps {
  onRefresh: () => Promise<void>;
  isDark: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh, isDark }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
        No chats available
      </Text>
      <TouchableOpacity
        style={[styles.refreshButton, { backgroundColor: isDark ? '#333' : '#eee' }]}
        onPress={onRefresh}
      >
        <Text style={[styles.refreshButtonText, { color: isDark ? '#fff' : '#000' }]}>
          Refresh
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontSize: 16,
  },
});

export default EmptyState;