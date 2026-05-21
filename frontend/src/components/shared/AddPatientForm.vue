<script setup>
import { onMounted, ref } from 'vue';
import { useNewPatient } from '@/composables/useNewPatient.js';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/lib/api.js';
import { ROLES } from '@/constants/roles.js';

const { createPatient } = useNewPatient();

const { userRole } = useAuth();

const registeredDoctors = ref([]);
const loadingDoctors = ref(false);

const submitting = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

const form = ref({ prenom: '', nom: '', email: '', tel: '', doctor: '' });

function formResetMode() {
  errorMessage.value = null;
  successMessage.value = null;
  form.value = { prenom: '', nom: '', email: '', tel: '', doctor: '' };
}

async function submit() {
  errorMessage.value = null;
  successMessage.value = null;
  submitting.value = true;

  if (userRole.value === ROLES.ASSISTANT) {
    if (!form.value.doctor) {
      errorMessage.value = 'Vous devez sélectionner un médecin pour ce patient.';
      submitting.value = false;
      return;
    }

    try {
      await createPatient(form.value.email, {
        nom: form.value.nom,
        prenom: form.value.prenom,
        tel: form.value.tel,
      });

      const patient_id = await api
        .get(
          `/api/assistant/single-patient?prenom=${encodeURIComponent(form.value.prenom)}&nom=${encodeURIComponent(form.value.nom)}`
        )
        .then((patients) => {
          const patient = patients.find(
            (p) => `${p.prenom} ${p.nom}` === `${form.value.prenom} ${form.value.nom}`
          );
          return patient.id;
        });

      await api.post('/api/assistant/assignments', {
        doctor_id: form.value.doctor,
        patient_id,
      });

      successMessage.value = 'Compte créé ! Le patient peut désormais se connecter à son compte.';
    } catch (err) {
      errorMessage.value = translateError(err.message);
    } finally {
      submitting.value = false;
    }
  } else if (userRole.value === ROLES.DOCTOR) {
    try {
      await createPatient(form.value.email, {
        nom: form.value.nom,
        prenom: form.value.prenom,
        tel: form.value.tel,
      });

      successMessage.value = 'Compte créé ! Le patient peut désormais se connecter à son compte.';
    } catch (err) {
      errorMessage.value = translateError(err.message);
    } finally {
      submitting.value = false;
    }
  }
}

function translateError(msg) {
  if (!msg) return 'Une erreur est survenue.';
  if (msg.includes('User already registered'))
    return 'Le patient est déjà enregistré sur MediTrack.';
  return msg;
}

onMounted(async () => {
  if (userRole.value === ROLES.ASSISTANT) {
    loadingDoctors.value = true;
    try {
      registeredDoctors.value = await api.get('/api/assistant/doctors');
    } finally {
      loadingDoctors.value = false;
    }
  }

  // Par défaut, on affiche le formulaire de création de patient (et pas de connexion)
  formResetMode();
});
</script>

<template>
  <div class="add-patient-page" :aria-label="`Inscrire un patient`">
    <h2>Inscrire un patient</h2>

    <!-- ── Formulaire création du patient ─────────────────────────────────────────────── -->
    <form @submit.prevent="submit" aria-label="Formulaire d'ajout d'un patient''">
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
        <span>Téléphone <span class="optional">(facultatif)</span></span>
        <input
          v-model.trim="form.tel"
          type="tel"
          autocomplete="tel"
          aria-label="Numéro de téléphone (facultatif)"
          :disabled="submitting"
        />
      </label>

      <!-- ── En attente de l'assignation d'un assitant avec plusieurs médecins  -->
      <template v-if="userRole === 'ASSISTANT'">
        <label class="field">
          <span>Médecin en charge du patient</span>
          <select v-model.trim="form.doctor">
            <option value="">Médecin de votre service</option>
            <option v-for="doctor in registeredDoctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.prenom }} {{ doctor.nom }}
            </option>
          </select>
        </label>
      </template>

      <p v-if="errorMessage" class="form-submit-error" role="alert">{{ errorMessage }}</p>
      <p v-if="successMessage" class="form-submit-success" role="status">{{ successMessage }}</p>

      <button type="submit" class="form-submit" :disabled="submitting">
        {{ submitting ? 'Chargement…' : 'Enregistrer' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.add-patient-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

form {
  padding: 32px 24px;
  height: 100%;
  width: 100%;
  max-width: clamp(320px, calc(100vw - 48px), 1400px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-light);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--color-gray-dark);
}

.field input {
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.15s;
}

.field input:focus {
  border-color: var(--color-primary-focus);
}

.field select {
  border: 1px solid var(--color-gray-light);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.field select:focus {
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

.required {
  color: var(--color-error-text);
}

.optional {
  color: #9ca3af;
  font-weight: 400;
}

.form-submit-error {
  background: var(--color-error-bg);
  color: var(--color-error-text);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.form-submit-success {
  background: var(--color-success-bg);
  color: var(--color-success-text);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.form-submit {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.form-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  form {
    display: flex;
    flex-direction: column;
  }
}
</style>
