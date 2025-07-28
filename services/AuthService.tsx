import { store } from '@/lib/store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
}

const USER_KEY = 'user_data';

export class AuthService {
  static async getUser(): Promise<User | null> {
    try {
      const userData = await store.get(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async saveUser(name: string): Promise<User> {
    const user: User = {
      id: uuidv4(),
      name: name.trim(),
    };
    console.log('Saving user:', user);
    await store.set(USER_KEY, JSON.stringify(user));
    return user;
  }

  static async clearUser(): Promise<void> {
    await store.delete(USER_KEY);
  }

  static async isUserLoggedIn(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null && user.name.length > 0;
  }
}