import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService, User } from '@/services/AuthService';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingIndicator from '@/components/common/LoadingIndicator';

export default function IndexScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AuthService.getUser();
      if (!userData) {
        router.replace('/credentials');
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
      router.replace('/credentials');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {user?.name}!</Text>
        <Text style={styles.subtitle}>Welcome to the app</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});