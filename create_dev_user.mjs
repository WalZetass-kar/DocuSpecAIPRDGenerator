import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://okxzxatqracirzjgqhsj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9reHp4YXRxcmFjaXJ6amdxaHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTE2MTM2NSwiZXhwIjoyMTAwNzM3MzY1fQ.2HrC2_jmmxYkV6MchE6dam2f52e7zln4Tv6xA3s-U-o';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createDevUser() {
  console.log('Creating developer user...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'mihwalmaulana09@gmail.com',
    password: 'kartikadeviL1@',
    email_confirm: true,
    user_metadata: { full_name: 'Admin Developer' }
  });

  if (authError) {
    console.error('Error creating user (maybe already exists?):', authError.message);
  }
  
  // Try to find the user if it already exists
  let userId = authData?.user?.id;
  
  if (!userId) {
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (users) {
      const existingUser = users.users.find(u => u.email === 'mihwalmaulana09@gmail.com');
      if (existingUser) {
        userId = existingUser.id;
        console.log('Found existing user:', userId);
        
        // Update password just in case
        await supabase.auth.admin.updateUserById(userId, { password: 'kartikadeviL1@', email_confirm: true });
      }
    }
  }

  if (userId) {
    console.log('Updating profile for user:', userId);
    
    // Add columns if they don't exist yet via RPC or we assume they do, but we haven't added them!
    // We should write the SQL first to add credits and subscription_plan to profiles.
    console.log('User ID:', userId);
  }
}

createDevUser();
