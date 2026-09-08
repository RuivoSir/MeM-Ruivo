import { createClient } from '@supabase/supabase-js'
import { supabasePublishableKey, supabaseUrl } from './supabaseConfig'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export const PHOTOS_BUCKET = 'room-photos'
