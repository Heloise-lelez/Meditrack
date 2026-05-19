<script setup>
import { computed, ref, onMounted } from 'vue';
import { api } from '../../../lib/api';

const props = defineProps({
  upcomingCount: { type: Number, default: 0 },
});

const emit = defineEmits(['created']);

const isModalOpen = ref(false);
const saving = ref(false);
const errorMessage = ref(null);
const doctors = ref([]);
const selectedDoctorId = ref('');

const form = ref({
  prenom: '',
  nom: '',
  profession: '',
  operation: '',
  date: '',
  heure: '',
  adresse: '',
});

function onDoctorChange() {
  const doc = doctors.value.find((d) => d.id === selectedDoctorId.value);
  if (doc) {
    form.value.prenom = doc.prenom;
    form.value.nom = doc.nom;
    form.value.profession = doc.specialite ?? '';
  } else {
    form.value.prenom = '';
    form.value.nom = '';
    form.value.profession = '';
  }
}

const resetForm = () => {
  selectedDoctorId.value = '';
  form.value = {
    prenom: '',
    nom: '',
    profession: '',
    operation: '',
    date: new Date().toISOString().slice(0, 10),
    heure: '09:00',
    adresse: '',
  };
};

const openModal = () => {
  errorMessage.value = null;
  resetForm();
  isModalOpen.value = true;
};

const closeModal = () => {
  if (saving.value) return;
  isModalOpen.value = false;
  errorMessage.value = null;
};

const upcomingLabel = computed(() => {
  const n = props.upcomingCount ?? 0;
  return `${n} à venir`;
});

const submit = async () => {
  errorMessage.value = null;
  if (!selectedDoctorId.value) {
    errorMessage.value = 'Veuillez sélectionner un médecin.';
    return;
  }
  if (!form.value.date || !form.value.heure) {
    errorMessage.value = 'Veuillez renseigner une date et une heure.';
    return;
  }

  saving.value = true;
  try {
    const startsAt = `${form.value.date}T${form.value.heure}:00`;

    await api.post('/api/rendezvous', {
      doctor_first_name: form.value.prenom,
      doctor_last_name: form.value.nom,
      profession: form.value.profession,
      operation: form.value.operation,
      address: form.value.adresse,
      starts_at: startsAt,
    });

    emit('created');
    closeModal();
  } catch (err) {
    console.error(err);
    errorMessage.value = err.message || "Impossible d'ajouter le rendez-vous.";
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    doctors.value = await api.get('/api/profile/doctors');
  } catch {
    /* non-bloquant */
  }
});
</script>

<template>
  <div class="add-rdv-container">
    <div class="add-rdv-text">
      <h2 id="rdv-title">Rendez vous</h2>
      <p>{{ upcomingLabel }}</p>
    </div>
    <button
      class="add-rdv-button"
      type="button"
      aria-label="Ajouter un nouveau rendez-vous"
      title="Ajouter"
      @click="openModal"
      :disabled="saving"
    >
      +
    </button>
  </div>

  <div
    v-if="isModalOpen"
    role="dialog"
    aria-modal="true"
    aria-label="Ajouter un rendez-vous"
    style="
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
      z-index: 60;
    "
    @click.self="closeModal"
  >
    <div
      style="
        background: #fff;
        border-radius: 14px;
        max-width: 560px;
        width: 100%;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
      "
    >
      <div
        style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px"
      >
        <div>
          <h3 style="margin: 0; font-size: 16px" tabindex="0">Ajouter un rendez-vous</h3>
          <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px">
            Renseigne les informations du RDV
          </p>
        </div>
        <button
          type="button"
          class="add-rdv-button"
          style="background: #e5e7eb; color: #111827; font-size: 14px"
          aria-label="Fermer le dialogue d'ajout de rendez-vous"
          @click="closeModal"
          :disabled="saving"
        >
          ✕
        </button>
      </div>

      <form
        aria-label="Formulaire d'ajout de rendez-vous"
        style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px"
        @submit.prevent="submit"
      >
        <label
          style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
        >
          Médecin
          <select
            v-model="selectedDoctorId"
            required
            aria-label="Choisir un médecin"
            style="
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              padding: 10px;
              font-size: 14px;
              background: #fff;
            "
            :disabled="saving"
            @change="onDoctorChange"
          >
            <option value="" disabled>Sélectionner un médecin…</option>
            <option v-for="d in doctors" :key="d.id" :value="d.id">
              Dr. {{ d.prenom }} {{ d.nom }}{{ d.specialite ? ' — ' + d.specialite : '' }}
            </option>
          </select>
        </label>

        <label
          style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
        >
          Spécialité / Profession
          <input
            v-model.trim="form.profession"
            required
            type="text"
            aria-label="Spécialité ou profession du médecin"
            placeholder="Ex: Cardiologue"
            style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
            :disabled="saving"
          />
        </label>

        <label
          style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
        >
          Motif / Opération
          <input
            v-model.trim="form.operation"
            required
            type="text"
            aria-label="Motif ou opération"
            placeholder="Ex: Consultation de suivi"
            style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
            :disabled="saving"
          />
        </label>

        <div style="display: flex; gap: 10px; flex-wrap: wrap">
          <label
            style="
              flex: 1;
              min-width: 180px;
              display: flex;
              flex-direction: column;
              gap: 6px;
              font-size: 12px;
              color: #374151;
            "
          >
            Date
            <input
              v-model="form.date"
              required
              type="date"
              aria-label="Date du rendez-vous"
              style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
              :disabled="saving"
            />
          </label>
          <label
            style="
              flex: 1;
              min-width: 180px;
              display: flex;
              flex-direction: column;
              gap: 6px;
              font-size: 12px;
              color: #374151;
            "
          >
            Heure
            <input
              v-model="form.heure"
              required
              type="time"
              aria-label="Heure du rendez-vous"
              style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
              :disabled="saving"
            />
          </label>
        </div>

        <label
          style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
        >
          Adresse
          <input
            v-model.trim="form.adresse"
            required
            type="text"
            aria-label="Adresse du rendez-vous"
            placeholder="Ex: 123 Rue de la Santé, Paris"
            style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
            :disabled="saving"
          />
        </label>

        <p v-if="errorMessage" style="margin: 0; color: #b91c1c; font-size: 12px">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="add-rdv-button"
          style="
            width: 100%;
            height: auto;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
          "
          aria-label="Enregistrer le nouveau rendez-vous"
          :disabled="saving"
        >
          {{ saving ? 'Ajout…' : 'Ajouter le rendez-vous' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-rdv-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.add-rdv-text h2 {
  margin: 0;
  font-size: 24px;
  color: #0f2722;
}
.add-rdv-text p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.add-rdv-button {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #3a8d7a;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
}
</style>
