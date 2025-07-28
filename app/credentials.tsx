import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService';
import { useColorScheme } from '@/hooks/useColorScheme';
import LoadingIndicator from '@/components/common/LoadingIndicator';

export default function CredentialsScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const isLoggedIn = await AuthService.isUserLoggedIn();
      if (isLoggedIn) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await AuthService.saveUser(name);
      router.replace('/');
    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save user information');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <LoadingIndicator />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Welcome!
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#ccc' : '#666' }]}>
            Please enter your name to continue
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? '#333' : '#f5f5f5',
                color: isDark ? '#fff' : '#000',
                borderColor: isDark ? '#555' : '#ddd',
              }
            ]}
            placeholder="Your name"
            placeholderTextColor={isDark ? '#888' : '#999'}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: isDark ? '#007AFF' : '#007AFF',
                opacity: loading ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
  },
});