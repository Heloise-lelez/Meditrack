import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const user = ref(null);
const loading = ref(true);

// Resolve initial session once on module load
supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user ?? null;
  loading.value = false;
});

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
});

export function useAuth() {
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signUp(email, password, { nom, prenom, tel }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nom, prenom, tel: tel || null } },
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { user, loading, signIn, signUp, signOut };
}
