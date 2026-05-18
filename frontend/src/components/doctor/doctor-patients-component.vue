<template>
  <main class="doctor" role="main" aria-label="Tableau de bord médecin">
    <!-- Patient detail view -->
    <DoctorPatientDetail
      v-if="selectedPatient"
      :patient="selectedPatient"
      @back="selectedPatient = null"
    />

    <!-- Patient list view -->
    <template v-else>
      <header class="doctor-header">
        <h1>Mes patients</h1>
      </header>

      <div class="doctor-container">
        <div v-if="loading" class="doctor-loading" role="status">
          <div class="spinner" aria-hidden="true"></div>
        </div>

        <p v-else-if="patients.length === 0" class="doctor-empty">
          Aucun patient assigné pour le moment.
        </p>

        <ul v-else class="patient-list" role="list">
          <li
            v-for="p in patients"
            :key="p.id"
            class="patient-card"
            role="button"
            tabindex="0"
            :aria-label="`Voir le dossier de ${p.prenom} ${p.nom}`"
            @click="selectedPatient = p"
            @keydown.enter.space.prevent="selectedPatient = p"
          >
            <div class="patient-avatar" aria-hidden="true">
              {{ p.prenom[0] }}{{ p.nom[0] }}
            </div>
            <div class="patient-info">
              <div class="patient-name">{{ p.prenom }} {{ p.nom }}</div>
              <div class="patient-meta">Assigné le {{ formatDate(p.assigned_at) }}</div>
            </div>
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </li>
        </ul>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import DoctorPatientDetail from './doctor-patient-detail-component.vue';
import './doctor.css';

const patients = ref([]);
const loading = ref(true);
const selectedPatient = ref(null);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

onMounted(async () => {
  try {
    patients.value = await api.get('/api/doctor/patients');
  } finally {
    loading.value = false;
  }
});
</script>
