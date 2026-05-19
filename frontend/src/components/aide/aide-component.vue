<template>
  <main class="aide" role="main" aria-label="Tableau de bord aide">
    <header class="aide-header">
      <h1>Mes patients</h1>
    </header>

    <div v-if="loading" class="aide-loading" role="status">
      <div class="spinner" aria-hidden="true"></div>
    </div>

    <div v-else-if="!selectedPatient">
      <p v-if="patients.length === 0" class="aide-empty">Aucun patient ne vous est assigné.</p>
      <div v-else class="aide-container">
        <ul class="patient-list" role="list">
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
            <div class="patient-avatar" aria-hidden="true">{{ p.prenom[0] }}{{ p.nom[0] }}</div>
            <div class="patient-info">
              <div class="patient-name">{{ p.prenom }} {{ p.nom }}</div>
            </div>
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </li>
        </ul>
      </div>
    </div>

    <AidePatientDetail
      v-else
      :patient="selectedPatient"
      @back="selectedPatient = null"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import AidePatientDetail from './aide-patient-detail-component.vue';
import './aide.css';

const patients = ref([]);
const loading = ref(true);
const selectedPatient = ref(null);

onMounted(async () => {
  try {
    const data = await api.get('/api/aide/patients');
    patients.value = (data || []).map((item) => ({
      id: item.patient_id,
      nom: item.profiles.nom,
      prenom: item.profiles.prenom,
    }));
  } catch {
    patients.value = [];
  } finally {
    loading.value = false;
  }
});
</script>
