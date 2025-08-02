import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  // Store a value securely
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }

  // Retrieve a value securely
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  // Delete a value
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw error;
    }
  }

  // Check if a key exists
  async hasItem(key: string): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error('Error checking secure item:', error);
      return false;
    }
  }

  // Store object securely (JSON stringified)
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await SecureStore.setItemAsync(key, jsonValue);
    } catch (error) {
      console.error('Error storing secure object:', error);
      throw error;
    }
  }

  // Retrieve object securely (JSON parsed)
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error retrieving secure object:', error);
      return null;
    }
  }

  // Clear all secure storage
  async clearAll(): Promise<void> {
    try {
      // Note: Expo SecureStore doesn't have a clearAll method
      // You would need to track your keys and remove them individually
      console.warn('SecureStore clearAll not implemented - remove items individually');
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw error;
    }
  }

  // Get all keys (for debugging purposes)
  async getAllKeys(): Promise<string[]> {
    // Note: Expo SecureStore doesn't provide a way to list all keys
    // This is a limitation of the library
    console.warn('SecureStore getAllKeys not available');
    return [];
  }
}

export const secureStore = new SecureStorage(); 