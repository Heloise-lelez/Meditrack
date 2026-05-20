<template>
  <main class="auth-page" role="main" aria-label="Authentification">
    <div class="auth-card">
      <div class="auth-header">
        <img src="@/assets/meditrack-logo-text.svg" alt="Logo Meditrack" />
      </div>

      <nav class="auth-tabs" role="tablist">
        <button
          role="tab"
          :aria-selected="isLogin"
          :class="['auth-tab', { active: isLogin }]"
          @click="switchMode(true)"
        >
          Connexion
        </button>
        <button
          role="tab"
          :aria-selected="!isLogin"
          :class="['auth-tab', { active: !isLogin }]"
          @click="switchMode(false)"
        >
          Inscription
        </button>
      </nav>

      <form
        @submit.prevent="submit"
        :aria-label="isLogin ? 'Formulaire de connexion' : 'Formulaire d\'inscription'"
      >
        <template v-if="!isLogin">
          <div class="field-row">
            <label class="field">
              <span>Prénom <span class="required" aria-hidden="true">*</span></span>
              <input
                v-model.trim="form.prenom"
                type="text"
                required
                autocomplete="given-name"
                aria-label="Prénom"
                :disabled="submitting"
              />
            </label>
            <label class="field">
              <span>Nom <span class="required" aria-hidden="true">*</span></span>
              <input
                v-model.trim="form.nom"
                type="text"
                required
                autocomplete="family-name"
                aria-label="Nom"
                :disabled="submitting"
              />
            </label>
          </div>
        </template>

        <label class="field">
          <span>Email <span class="required" aria-hidden="true">*</span></span>
          <input
            v-model.trim="form.email"
            type="email"
            required
            autocomplete="email"
            aria-label="Adresse email"
            :disabled="submitting"
          />
        </label>

        <label class="field">
          <span>Mot de passe <span class="required" aria-hidden="true">*</span></span>
          <input
            v-model="form.password"
            type="password"
            required
            :minlength="isLogin ? undefined : 6"
            autocomplete="current-password"
            aria-label="Mot de passe"
            :disabled="submitting"
          />
          <span v-if="!isLogin" class="field-hint">Minimum 6 caractères</span>
        </label>

        <template v-if="!isLogin">
          <label class="field">
            <span>Téléphone <span class="optional">(facultatif)</span></span>
            <input
              v-model.trim="form.tel"
              type="tel"
              autocomplete="tel"
              aria-label="Numéro de téléphone (facultatif)"
              :disabled="submitting"
            />
          </label>
        </template>

        <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="auth-success" role="status">{{ successMessage }}</p>

        <button type="submit" class="auth-submit" :disabled="submitting">
          {{ submitting ? 'Chargement…' : isLogin ? 'Se connecter' : 'Créer mon compte' }}
        </button>

        <button
          v-if="isLogin"
          type="button"
          class="auth-link"
          :disabled="submitting || !form.email"
          @click="forgotPassword"
        >
          Mot de passe oublié ?
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';

const router = useRouter();
const { signIn, signUp, requestPasswordReset } = useAuth();

const isLogin = ref(true);
const submitting = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const form = ref({ prenom: '', nom: '', email: '', password: '', tel: '' });

function switchMode(toLogin) {
  isLogin.value = toLogin;
  errorMessage.value = null;
  successMessage.value = null;
  form.value = { prenom: '', nom: '', email: '', password: '', tel: '' };
}

async function submit() {
  errorMessage.value = null;
  successMessage.value = null;
  submitting.value = true;
  try {
    if (isLogin.value) {
      await signIn(form.value.email, form.value.password);
      router.push('/');
    } else {
      await signUp(form.value.email, form.value.password, {
        nom: form.value.nom,
        prenom: form.value.prenom,
        tel: form.value.tel,
      });
      successMessage.value = 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.';
    }
  } catch (err) {
    errorMessage.value = translateError(err.message);
  } finally {
    submitting.value = false;
  }
}

async function forgotPassword() {
  errorMessage.value = null;
  successMessage.value = null;
  if (!form.value.email) {
    errorMessage.value = 'Renseignez votre email pour réinitialiser le mot de passe.';
    return;
  }

  submitting.value = true;
  try {
    await requestPasswordReset(form.value.email);
    successMessage.value = 'Email de réinitialisation envoyé si le compte existe.';
  } catch (err) {
    errorMessage.value = translateError(err.message);
  } finally {
    submitting.value = false;
  }
}

function translateError(msg) {
  if (!msg) return 'Une erreur est survenue.';
  if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed'))
    return 'Veuillez confirmer votre email avant de vous connecter.';
  if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet email.';
  if (msg.includes('Password should be at least'))
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  return msg;
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-background);
  padding: 24px 16px;
}

.auth-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: 32px 24px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 0 24px rgba(15, 39, 34, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.auth-header img {
  height: 40px;
  width: auto;
}

.auth-tabs {
  display: flex;
  gap: 0;
  border-radius: var(--radius-sm);
  background: var(--color-gray-light);
  padding: 4px;
  margin-bottom: 24px;
}

.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-dark);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.auth-tab.active {
  background: var(--color-white);
  color: var(--color-primary-active);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 14px;
}

.field input {
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-sm);
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
  color: var(--color-gray);
  margin-top: -2px;
}

.required {
  color: var(--color-error);
}

.optional {
  color: var(--color-gray);
  font-weight: 400;
}

.auth-error {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.auth-success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.auth-submit {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-white);
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

.auth-link {
  width: 100%;
  margin-top: 12px;
  border: none;
  background: transparent;
  color: var(--color-primary-dark);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.auth-link:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
