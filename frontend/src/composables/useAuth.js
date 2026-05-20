import { ref } from 'vue';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { auditClientEvent } from '../lib/auditClient';
import { ROLES } from '@/constants/roles';
import { useDoctor } from './useDoctor';
import { useAssistant } from './useAssistant';

const user = ref(null);
const userRole = ref(null);
const loading = ref(true);

const { setDoctorPassword } = useDoctor();
const { setAssistantPassword } = useAssistant();

async function fetchRole() {
  try {
    const data = await api.get('/api/profile/my-role');
    userRole.value = data.role ?? 'PATIENT';
    user.value = {
      ...user.value,
      user_metadata: {
        ...(user.value.user_metadata || {}),
        is_accompanied: data.is_accompanied,
      },
    };
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
    await auditClientEvent('auth.sign_in.attempt', { email });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await auditClientEvent('auth.sign_in.failure', {
        email,
        metadata: { message: error.message, code: error.code },
      });
      throw error;
    }
    await auditClientEvent('auth.sign_in.success', { email }, { authenticated: true });
  }

  async function signUp(email, password, { nom, prenom, tel, role }) {
    await auditClientEvent('auth.sign_up.attempt', { email });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nom, prenom, tel: tel || null, role } },
    });
    if (error) {
      await auditClientEvent('auth.sign_up.failure', {
        email,
        metadata: { message: error.message, code: error.code },
      });
      throw error;
    } else {
      if (role === ROLES.DOCTOR) {
        setDoctorPassword(password);
      }

      if (role === ROLES.ASSISTANT) {
        setAssistantPassword(password);
      }

      await auditClientEvent('auth.sign_up.success', { email });
    }
  }

  async function requestPasswordReset(email) {
    await auditClientEvent('auth.password_reset.request', { email });
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      await auditClientEvent('auth.password_reset.failure', {
        email,
        metadata: { message: error.message, code: error.code },
      });
      throw error;
    }
    await auditClientEvent('auth.password_reset.success', { email });
  }

  async function signOut() {
    await auditClientEvent('auth.sign_out', {}, { authenticated: true });
    await supabase.auth.signOut();
  }

  return { user, userRole, loading, signIn, signUp, signOut, requestPasswordReset };
}
