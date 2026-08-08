import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { AppState } from 'react-native';
import { createClient } from '@supabase/supabase-js';

import { Config } from './config';

const ExpoSecureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const OAUTH_REDIRECT_URL = Linking.createURL('auth/callback');

export const supabase = createClient(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: ExpoSecureStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});