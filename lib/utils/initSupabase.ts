import { createClient } from '@supabase/supabase-js';

// const supabase = createClient(
//   import.meta.env.VITE_PUBLIC_SUPABASE_URL as string,
//   import.meta.env.VITE_PUBLIC_SUPABASE_KEY as string
// );
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string
);

export default supabase;
