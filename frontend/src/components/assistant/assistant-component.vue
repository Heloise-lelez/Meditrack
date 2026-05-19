<template>
  <main class="assistant" role="main" aria-label="Gestion des assignations">
    <header class="assistant-header">
      <h1>Assignations patients / médecins</h1>
    </header>

    <div v-if="loading" class="assistant-loading" role="status">
      <div class="spinner" aria-hidden="true"></div>
    </div>

    <div v-else class="assistant-body">
      <!-- Left: patient list -->
      <section class="col" aria-label="Liste des patients">
        <h2>Patients</h2>
        <ul class="person-list" role="list">
          <li v-if="patients.length === 0" class="person-empty">Aucun patient.</li>
          <li
            v-for="p in patients"
            :key="p.id"
            class="person-row"
            :class="{ selected: selectedPatient?.id === p.id }"
            role="button"
            tabindex="0"
            :aria-label="`Sélectionner ${p.prenom} ${p.nom}`"
            @click="selectedPatient = p"
            @keydown.enter.space.prevent="selectedPatient = p"
          >
            <div class="person-avatar" aria-hidden="true">{{ p.prenom[0] }}{{ p.nom[0] }}</div>
            <div class="person-info">
              <div class="person-name">{{ p.prenom }} {{ p.nom }}</div>
              <div class="person-doctors">
                {{
                  doctorsOf(p.id)
                    .map((d) => `Dr. ${d.prenom} ${d.nom}`)
                    .join(', ') || 'Aucun médecin'
                }}
              </div>
            </div>
          </li>
        </ul>
      </section>

      <!-- Right: doctor list + assignment -->
      <section class="col" aria-label="Liste des médecins">
        <h2>Médecins</h2>
        <p v-if="!selectedPatient" class="col-hint">← Sélectionner un patient pour assigner</p>
        <ul v-else class="person-list" role="list">
          <li v-if="doctors.length === 0" class="person-empty">Aucun médecin.</li>
          <li v-for="d in doctors" :key="d.id" class="person-row doctor-row">
            <div class="person-avatar doctor-avatar" aria-hidden="true">
              {{ d.prenom[0] }}{{ d.nom[0] }}
            </div>
            <div class="person-info">
              <div class="person-name">Dr. {{ d.prenom }} {{ d.nom }}</div>
            </div>
            <button
              v-if="isAssigned(selectedPatient.id, d.id)"
              class="btn-unassign"
              :aria-label="`Retirer ${d.prenom} ${d.nom} du patient`"
              :disabled="busy"
              @click="unassign(selectedPatient.id, d.id)"
            >
              Retirer
            </button>
            <button
              v-else
              class="btn-assign"
              :aria-label="`Assigner ${d.prenom} ${d.nom} au patient`"
              :disabled="busy"
              @click="assign(selectedPatient.id, d.id)"
            >
              Assigner
            </button>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import './assistant.css';

const patients = ref([]);
const doctors = ref([]);
const assignments = ref([]);
const loading = ref(true);
const busy = ref(false);
const selectedPatient = ref(null);

const isAssigned = (patientId, doctorId) =>
  assignments.value.some((a) => a.patient_id === patientId && a.doctor_id === doctorId);

const doctorsOf = (patientId) =>
  assignments.value
    .filter((a) => a.patient_id === patientId)
    .map((a) => doctors.value.find((d) => d.id === a.doctor_id))
    .filter(Boolean);

const assign = async (patient_id, doctor_id) => {
  busy.value = true;
  try {
    await api.post('/api/assistant/assignments', { patient_id, doctor_id });
    assignments.value.push({ patient_id, doctor_id });
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

const unassign = async (patient_id, doctor_id) => {
  busy.value = true;
  try {
    await api.delete('/api/assistant/assignments', { patient_id, doctor_id });
    assignments.value = assignments.value.filter(
      (a) => !(a.patient_id === patient_id && a.doctor_id === doctor_id)
    );
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

onMounted(async () => {
  try {
    const [p, d, a] = await Promise.all([
      api.get('/api/assistant/patients'),
      api.get('/api/assistant/doctors'),
      api.get('/api/assistant/assignments'),
    ]);
    patients.value = p;
    doctors.value = d;
    assignments.value = a;
  } finally {
    loading.value = false;
  }
});
</script>
