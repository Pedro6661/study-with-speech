 import { createClient } from '@supabase/supabase-js';

const supaUrl = 'https://knutpljugbudklxdfgnj.supabase.co';

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudXRwbGp1Z2J1ZGtseGRmZ25qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODU0NDQsImV4cCI6MjA2NTI2MTQ0NH0.d03FJTCe2co1nsL_qxn9XH_2aheq1fhaVIfF5Lcjk04';


export const supabase = createClient(supaUrl, anonKey);
export default supabase;