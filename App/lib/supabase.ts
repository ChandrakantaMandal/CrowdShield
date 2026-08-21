import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { AppState } from 'react-native';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { Config } from './config';

const ExpoSecureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const OAUTH_REDIRECT_URL = Linking.createURL('auth/callback');

let supabaseClient: SupabaseClient | null = null;

try {
  if (Config.isConfigured) {
    supabaseClient = createClient(
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
  } else {
    console.error(
      '[Supabase] Cannot initialize client — env vars missing. ' +
        'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
} catch (err) {
  console.error('[Supabase] Failed to create client:', err);
}

export const supabase = supabaseClient as SupabaseClient;

if (supabaseClient) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabaseClient!.auth.startAutoRefresh();
    } else {
      supabaseClient!.auth.stopAutoRefresh();
    }
  });
}
