import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://skxtwwbghmzmchedlglf.supabase.co' // dari dashboard API
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNreHR3d2JnaG16bWNoZWRsZ2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTEwMTcsImV4cCI6MjA2Mjc4NzAxN30.IRu3Jzsz1-mpya__I5s8TceJA3RmoH1MUPI9KfVzkQ4' // dari dashboard API
export const supabase = createClient(supabaseUrl, supabaseKey)
