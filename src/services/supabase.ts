import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabaseConfig';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    !SUPABASE_URL.includes('TU_PROYECTO') &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_ANON_KEY.includes('TU_ANON_KEY')
  );
};

export const supabase = createClient(
  isSupabaseConfigured() ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? SUPABASE_ANON_KEY : 'placeholder-anon-key',
  {
    realtime: {
      params: {
        eventsPerSecond: 15,
      },
    },
  }
);
