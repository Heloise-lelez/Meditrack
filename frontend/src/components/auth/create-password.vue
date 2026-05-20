<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNewPatient } from '@/composables/useNewPatient';

const router = useRouter();

const { getSession, createFirstPassword } = useNewPatient();

const form = ref({ password: '' });
const loading = ref(false);
const ready = ref(false);
const errorMessage = ref(null);

// ----------------------------
// INIT
// ----------------------------
onMounted(async () => {
  try {
    const session = await getSession();

    console.log('[session]', session);

    if (!session) {
      throw new Error('No session found from email link');
    }

    ready.value = true;
  } catch (err) {
    errorMessage.value = err.message;
  }
});

// ----------------------------
// SUBMIT PASSWORD
// ----------------------------
async function submit() {
  loading.value = true;
  errorMessage.value = null;

  try {
    await createFirstPassword(form.value.password);

    router.push('/');
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="auth-page" role="main" aria-label="Authentification">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Créez votre mot de passe</h1>
      </div>

      <form
        @submit.prevent="submit"
        aria-label="'Formulaire de création d'un premier mot de passe'"
      >
        <label class="field">
          <input
            v-model.trim="form.password"
            type="password"
            required
            autocomplete="current-password"
            aria-label="Mot de passe"
            :disabled="loading"
          />
        </label>

        <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>

        <button type="submit" class="auth-submit" :disabled="submitting">
          {{ submitting ? 'Chargement…' : 'Enregistrer' }}
        </button>
      </form>
    </div>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 24px 16px;
}

.auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  width: 100%;
  max-width: 700px;
  box-shadow: 0 8px 24px rgba(15, 39, 34, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #0f2722;
}

.auth-header p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.auth-tabs {
  display: flex;
  gap: 0;
  border-radius: 10px;
  background: #f3f4f6;
  padding: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.auth-tab.active {
  background: #fff;
  color: #0f2722;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 14px;
}

.field input {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--color-primary-focus);
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
  min-width: 0;
}

.field-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: -2px;
}

.required {
  color: #b91c1c;
}

.optional {
  color: #9ca3af;
  font-weight: 400;
}

.auth-error {
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.auth-success {
  background: #f0fdf4;
  color: #166534;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.auth-submit {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.auth-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
