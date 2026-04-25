import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibtjomwxbkvmcowiffrb.supabase.co'

const supabaseAnonKey = 'sb_publishable_pHFYaOru4i8E0NMiVqo64g_2FFM98sW'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)