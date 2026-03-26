const supabase = window.bccSupabase;

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}

async function isOwner() {
  const session = await getSession();
  if (!session?.user) return false;
  const email = session.user.email || '';
  const { data, error } = await supabase
    .from('owner_accounts')
    .select('user_id,email')
    .or(`user_id.eq.${session.user.id},email.eq.${email}`)
    .maybeSingle();
  return !error && !!data;
}

async function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + window.location.pathname
    }
  });
}

async function signOut() {
  return supabase.auth.signOut();
}

window.bccAuth = { getSession, isOwner, signInWithEmail, signOut };
