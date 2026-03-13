import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zxhgviraiiytpdjbuhpy.supabase.co'
const supabaseAnonKey = 'sb_publishable_c3MRfQVEtQUt6SdQFYq5Kw_kURhd3S8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
