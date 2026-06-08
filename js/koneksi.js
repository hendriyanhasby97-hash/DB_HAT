import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://trxakqvaxleslwmngsvr.supabase.co';
const supabaseKey = 'sb_publishable_fKDMGUajM2z2CbLVk2DuGg_8mSdHQoC';

export const supabase = createClient(supabaseUrl, supabaseKey);
