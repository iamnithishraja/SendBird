import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Home',
            headerLeft: () => null, // Prevent going back
            gestureEnabled: false, // Disable swipe back on iOS
          }} 
        />
        <Stack.Screen 
          name="credentials" 
          options={{ 
            title: 'Welcome',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="chat/[id]" 
          options={{ 
            title: 'Chat',
            headerShown: false 
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}