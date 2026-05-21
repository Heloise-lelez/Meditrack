<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProfile } from '@/composables/useProfile.js';

const { getPassword, updatePassword } = useProfile();

const newPassword = ref('');
const showPassword = ref(false);
const saving = ref(false);
const feedback = ref(null);

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'));
const passwordIcon = computed(() => (showPassword.value ? 'fa-eye-slash' : 'fa-eye'));
const passwordLabel = computed(() => (showPassword.value ? 'Masquer' : 'Afficher'));

onMounted(() => {
  try {
    const currentPwd = getPassword();
    if (currentPwd) {
      newPassword.value = currentPwd;
    }
  } catch (e) {
    console.warn('Impossible de récupérer le mot de passe actuel:', e);
  }
});

async function handleSavePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    feedback.value = {
      type: 'error',
      message: 'Le mot de passe doit faire au moins 6 caractères.',
    };
    return;
  }

  saving.value = true;
  feedback.value = null;

  try {
    await updatePassword(newPassword.value);
    feedback.value = { type: 'success', message: 'Mot de passe mis à jour avec succès.' };
  } catch (err) {
    console.error(err);
    feedback.value = {
      type: 'error',
      message: err.message || 'Erreur lors de la mise à jour du mot de passe.',
    };
  } finally {
    saving.value = false;
    setTimeout(() => {
      feedback.value = null;
    }, 4000);
  }
}

function toggleVisibility() {
  showPassword.value = !showPassword.value;
}
</script>

<template>
  <section class="card" aria-label="Sécurité du compte">
    <h2 class="card-title">Sécurité & Mot de passe</h2>

    <div v-if="feedback" :class="['feedback-state', feedback.type]" role="alert">
      <i
        :class="
          feedback.type === 'success'
            ? 'fa-solid fa-circle-check'
            : 'fa-solid fa-circle-exclamation'
        "
        aria-hidden="true"
      ></i>
      <span>{{ feedback.message }}</span>
    </div>

    <div class="password-edit-container">
      <div class="password-row">
        <span class="info-label"> <i class="fa-solid fa-lock"></i> Nouveau mot de passe </span>

        <div class="input-wrapper">
          <input
            id="new-password"
            v-model="newPassword"
            class="info-input"
            :type="passwordFieldType"
            placeholder="••••••••••••"
            :disabled="saving"
            autocomplete="new-password"
          />

          <button
            type="button"
            class="password-toggle-btn"
            @click="toggleVisibility"
            :aria-label="passwordLabel"
            :disabled="saving"
            tabindex="-1"
          >
            <i :class="['fa-solid', passwordIcon]" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="info-row action-row">
        <span class="info-label"></span>
        <button class="save-btn" :disabled="saving || !newPassword" @click="handleSavePassword">
          <span v-if="saving" class="mini-spinner-inline" aria-hidden="true"></span>
          {{ saving ? 'Mise à jour…' : 'Changer le mot de passe' }}
        </button>
      </div>

      <p class="hint-text">
        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
        Assurez-vous que votre mot de passe contient au moins 6 caractères.
      </p>
    </div>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: transparent;
}

.feedback-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.feedback-state.success {
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
}

.feedback-state.error {
  color: #842029;
  background: #f8d7da;
  border: 1px solid #f5c2c7;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Conteneur */
.password-edit-container {
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-md);
  background-color: var(--color-off-white);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.password-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gray-light);
  gap: 16px;
  background: var(--color-white);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-gray-light);
  gap: 16px;
  transition: background-color 0.2s ease;
}

.info-label {
  width: 210px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-gray-dark);
  font-weight: 500;
  white-space: nowrap;
  font-size: 14px;
  flex-shrink: 0;
}

.info-label i {
  font-size: 14px;
  color: var(--color-primary);
}

.input-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  position: relative;
}

.info-input {
  width: 100%;
  max-width: 250px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  color: var(--color-black);
  font-weight: 500;
  text-align: right;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.info-input:hover:not(:disabled) {
  border-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-background);
  background: var(--color-white);
}

.info-input::placeholder {
  color: var(--color-gray);
  font-weight: 400;
  font-style: italic;
}

.info-input:disabled {
  background: var(--color-gray-light);
  color: var(--color-gray);
  cursor: not-allowed;
  border-color: transparent;
}

.password-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-sm);
  background: var(--color-white);
  color: var(--color-gray-dark);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.password-toggle-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.password-toggle-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.password-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-row {
  background: var(--color-white);
  justify-content: flex-end;
  padding: 16px 20px;
  border-bottom: none;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.save-btn:active:not(:disabled) {
  transform: translateY(0);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.hint-text {
  margin: 0;
  padding: 12px 20px;
  font-size: 12px;
  color: var(--color-gray);
  background: rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 6px;
}

.hint-text i {
  font-size: 10px;
}

.mini-spinner-inline {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .password-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-label {
    width: 100%;
  }

  .input-wrapper {
    max-width: 100%;
    margin-left: 0;
  }

  .action-row {
    justify-content: stretch;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
