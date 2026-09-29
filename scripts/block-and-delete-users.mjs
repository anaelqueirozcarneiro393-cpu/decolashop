import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'next_auth' }
});

const emails = [
  "felipeferreirsas233789@gmail.com",
  "felipevitoriano18@gmail.com",
  "felipepdasilva12345@gmail.com",
  "felipepolski77@gmail.com",
  "felipe2012ester@gmail.com",
  "felipenonato87@gmail.com"
];

async function main() {
  console.log("Starting deletion of blocked users...");
  
  // 1. Delete from next_auth.users
  const { data: deletedUsers, error: deleteError } = await supabase
    .from('users')
    .delete()
    .in('email', emails)
    .select();
    
  if (deleteError) {
    console.error("Error deleting users:", deleteError);
  } else {
    console.log("Deleted users count:", deletedUsers ? deletedUsers.length : 0);
    console.log("Deleted users:", deletedUsers);
  }

  // 2. Delete from next_auth.pending_purchases
  const { data: deletedPending, error: pendingError } = await supabase
    .from('pending_purchases')
    .delete()
    .in('email', emails)
    .select();
    
  if (pendingError) {
    console.error("Error deleting pending purchases:", pendingError);
  } else {
    console.log("Deleted pending purchases count:", deletedPending ? deletedPending.length : 0);
    console.log("Deleted pending purchases:", deletedPending);
  }
}

main();
