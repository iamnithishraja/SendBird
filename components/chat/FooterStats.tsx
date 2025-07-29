import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FooterStatsProps {
  channelCount: number;
  isDark: boolean;
}

const FooterStats: React.FC<FooterStatsProps> = ({ channelCount, isDark }) => {
  return (
    <View style={[styles.footer, { borderTopColor: isDark ? '#333' : '#eee' }]}>
      <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
        {channelCount} chat{channelCount !== 1 ? 's' : ''} • Real-time updates
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default FooterStats;