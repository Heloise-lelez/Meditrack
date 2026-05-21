<template>
  <main class="search-page" role="main" aria-label="Rechercher un patient">
    <div class="search-box">
      <input
        v-model="query"
        type="search"
        class="search-input"
        placeholder="Nom ou prénom du patient…"
        aria-label="Rechercher un patient par nom"
        @input="onInput"
      />
    </div>

    <section v-if="results.length" class="results-section" aria-label="Résultats de recherche">
      <div v-for="p in results" :key="p.id" class="patient-row">
        <span class="patient-name">{{ p.prenom }} {{ p.nom }}</span>
        <button
          v-if="assignedIds.has(p.id)"
          class="btn-unassign"
          :disabled="loadingId === p.id"
          @click="unassign(p)"
        >
          {{ loadingId === p.id ? '…' : 'Se désassigner' }}
        </button>
        <button v-else class="btn-assign" :disabled="loadingId === p.id" @click="assign(p)">
          {{ loadingId === p.id ? '…' : "S'assigner" }}
        </button>
      </div>
    </section>

    <p v-else-if="query.trim().length >= 2 && !loading" class="empty-msg">Aucun patient trouvé.</p>

    <p v-if="errorMsg" class="error-msg" role="alert">{{ errorMsg }}</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';

const query = ref('');
const results = ref([]);
const loading = ref(false);
const loadingId = ref(null);
const errorMsg = ref(null);
const assignedIds = ref(new Set());

let debounceTimer = null;

async function loadAssigned() {
  try {
    const patients = await api.get('/api/doctor/patients');
    assignedIds.value = new Set(patients.map((p) => p.id));
  } catch {
    // non-blocking
  }
}

function onInput() {
  errorMsg.value = null;
  clearTimeout(debounceTimer);
  const q = query.value.trim();
  if (q.length < 2) {
    results.value = [];
    return;
  }
  debounceTimer = setTimeout(() => search(q), 300);
}

async function search(q) {
  loading.value = true;
  try {
    results.value = await api.get(`/api/doctor/patients/search?q=${encodeURIComponent(q)}`);
  } catch {
    errorMsg.value = 'Erreur lors de la recherche.';
  } finally {
    loading.value = false;
  }
}

async function assign(patient) {
  loadingId.value = patient.id;
  errorMsg.value = null;
  try {
    await api.post('/api/doctor/patients/self-assign', { patient_id: patient.id });
    assignedIds.value = new Set([...assignedIds.value, patient.id]);
  } catch (err) {
    errorMsg.value = err.message ?? "Erreur lors de l'assignation.";
  } finally {
    loadingId.value = null;
  }
}

async function unassign(patient) {
  loadingId.value = patient.id;
  errorMsg.value = null;
  try {
    await api.delete('/api/doctor/patients/self-unassign', { patient_id: patient.id });
    const next = new Set(assignedIds.value);
    next.delete(patient.id);
    assignedIds.value = next;
  } catch (err) {
    errorMsg.value = err.message ?? 'Erreur lors de la désassignation.';
  } finally {
    loadingId.value = null;
  }
}

onMounted(loadAssigned);
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.search-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.search-box {
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: #0f2722;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.results-section {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 39, 34, 0.08);
  overflow: hidden;
}

.patient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #f3f4f6;
  gap: 12px;
}

.patient-row:last-child {
  border-bottom: none;
}

.patient-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f2722;
}

.btn-assign,
.btn-unassign {
  flex-shrink: 0;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-assign {
  background: var(--color-primary);
  color: #fff;
}

.btn-assign:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-unassign {
  background: #fef2f2;
  color: #b91c1c;
}

.btn-unassign:hover:not(:disabled) {
  background: #fee2e2;
}

.btn-assign:disabled,
.btn-unassign:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-msg,
.error-msg {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.error-msg {
  color: #b91c1c;
}
</style>
