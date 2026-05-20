<script setup>
import { onMounted, ref } from 'vue';
import { useNewPatient } from '../../composables/useNewPatient';
import { useAuth } from '../../composables/useAuth';
import { api } from '../../lib/api';

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

  if (userRole.value === 'ASSISTANT' && !form.value.doctor) {
    if (form.value.doctor === '') {
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

      const doctor_id = await api
        .get('/single-doctor', {
          params: {
            prenom: form.value.doctor.split(' ')[0],
            nom: form.value.doctor.split(' ')[1],
          },
        })
        .then((res) => {
          const doctor = res.data.find((d) => `${d.prenom} ${d.nom}` === form.value.doctor);
          return doctor.id;
        });

      const patient_id = await api
        .get('/single-patient', {
          params: {
            prenom: form.value.prenom,
            nom: form.value.nom,
          },
        })
        .then((res) => {
          const patient = res.data.find(
            (p) => `${p.prenom} ${p.nom}` === `${form.value.prenom} ${form.value.nom}`
          );
          return patient.id;
        });

      await api.post('/assignments', {
        doctor_id,
        patient_id,
      });

      successMessage.value = 'Compte créé ! Le patient peut désormais se connecter à son compte.';
    } catch (err) {
      errorMessage.value = translateError(err.message);
    } finally {
      submitting.value = false;
    }
  } else if (userRole.value === 'DOCTOR') {
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
  if (userRole.value === 'PATIENT') {
    loadingDoctors.value = true;
    try {
      registeredDoctors.value = await api.get('/doctors');
    } finally {
      loadingDoctors.value = false;
    }
  }

  // Par défaut, on affiche le formulaire de création de patient (et pas de connexion)
  formResetMode();
});
</script>

<template>
  <div class="detail" :aria-label="`Inscrire un patient`">
    <!-- Header -->
    <header class="detail-header">
      <!-- <button class="back-btn" @click="$emit('back')" aria-label="Retour à la liste">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        Retour
      </button> -->
      <h1>Inscrire un patient</h1>
    </header>

    <!-- Sub-tabs
    <nav class="sub-tabs" role="tablist" aria-label="Sections du dossier">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="sub-tab"
        :class="{ active: activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </nav> -->

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
            <option v-for="doctor in registeredDoctors" :key="doctor.id">
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
.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  width: 100%;
  height: 100%;
}

.detail-header {
  max-width: 420px;
  padding-top: 35px;
  padding-bottom: 35px;
}

form {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 32px 24px;
  max-width: clamp(320px, calc(100vw - 48px), 1400px);
  width: 100%;
  height: 100%;
  align-items: stretch;
  overflow: auto;
  background: #fff;
  box-sizing: border-box;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 39, 34, 0.1);
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

.field select {
  border: 1px solid #e5e7eb;
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

.form-submit-error {
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0 0 14px;
}

.form-submit-success {
  background: #f0fdf4;
  color: #166534;
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
  color: #fff;
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
</style>
