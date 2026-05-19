import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

const user = ref(null);
const userRole = ref(null);
const loading = ref(true);

async function fetchRole() {
  try {
    const data = await api.get('/api/profile/my-role');
    userRole.value = data.role ?? 'PATIENT';
  } catch {
    userRole.value = 'PATIENT';
  }
}

supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user ?? null;
  if (user.value) {
    fetchRole().finally(() => {
      loading.value = false;
    });
  } else {
    loading.value = false;
  }
});

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null;
  if (user.value) {
    fetchRole();
  } else {
    userRole.value = null;
  }
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

  return { user, userRole, loading, signIn, signUp, signOut };
}
