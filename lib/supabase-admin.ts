
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin operations may fail.')
}

export const supabaseAdmin = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceRoleKey || 'placeholder-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
