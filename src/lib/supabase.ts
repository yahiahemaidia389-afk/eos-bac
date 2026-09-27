import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase URL and Anon key from client env, with default configuration
const defaultUrl = 'https://hngiigrtooyalidmqjar.supabase.co';
const defaultKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZ2lpZ3J0b295YWxpZG1xamFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Nzc3MzQsImV4cCI6MjEwNTU1MzczNH0.DmMN5YcsWin_jxu4vcFRp3ElLGKQW56f3AKo04aZSoc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
