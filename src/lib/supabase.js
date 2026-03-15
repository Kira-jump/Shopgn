import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmymiolsgjzkygomgygr.supabase.co'
const supabaseKey = 'sb_publishable_25e8dmsJV36y3kg1LGOBVg_cp7Uaibi'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'guineeshop-auth',
  }
})
