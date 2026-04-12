import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'nano ~/guineeshop/src/lib/supabase.js'
const supabaseKey = 'sb_publishable_UIcZEYgho0KOTeLRbq6sDg_IyxW4qXM'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'guineeshop-auth',
  }
})
