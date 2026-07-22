import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jkfruplfaxdiufrqzeew.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2mnbMuxBoH9kugDa86HGTg_ghuk0ycN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
