<script setup>
import { computed, onMounted, ref } from 'vue';
import './rdv.css';
import Header from '../Chirurgie_Suivi/Header.vue';
import RdvCardsComponent from './rdvCards/rdv-cards-component.vue';
import { api } from '../../lib/api';

const rdvs = ref([]);
const loading = ref(true);
const errorMessage = ref(null);

const loadRdvs = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    rdvs.value = await api.get('/api/rendezvous');
  } catch (err) {
    console.error(err);
    errorMessage.value = "Impossible de charger les rendez-vous.";
    rdvs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRdvs();
});

const now = () => new Date();

const upcoming = computed(() =>
  rdvs.value.filter((r) => new Date(r.starts_at) >= now())
);

const past = computed(() =>
  rdvs.value
    .filter((r) => new Date(r.starts_at) < now())
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at))
);

const formatDateFr = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const isDetailsOpen = ref(false);
const selectedRdv = ref(null);
const selectedIsPast = ref(false);
const deleteError = ref(null);

const openDetails = (rdv, isPast) => {
  selectedRdv.value = rdv;
  selectedIsPast.value = isPast;
  isDetailsOpen.value = true;
};

const closeDetails = () => {
  isDetailsOpen.value = false;
  selectedRdv.value = null;
  selectedIsPast.value = false;
  deleteError.value = null;
};

const deleteRdv = async (id) => {
  if (!confirm('Supprimer ce rendez-vous ?')) return;
  deleteError.value = null;
  try {
    await api.delete(`/api/rendezvous/${id}`);
    closeDetails();
    await loadRdvs();
  } catch (err) {
    console.error(err);
    deleteError.value = 'Impossible de supprimer ce rendez-vous.';
  }
};
</script>

<template>
    <Header />
  <div class="rdv-page-header">
    <div>
      <h2 style="margin:0;font-size:24px;color:#0f2722;">Rendez-vous</h2>
      <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">{{ upcoming.length }} à venir</p>
    </div>
  </div>

  <p v-if="loading" style="color:#6b7280;font-size:12px;margin:8px 0;">Chargement…</p>
  <p v-else-if="errorMessage" style="color:#b91c1c;font-size:12px;margin:8px 0;">
    {{ errorMessage }}
  </p>

  <h2 id="upcoming-title" tabindex="0" aria-label="Rendez vous à venir">A venir</h2>
  <div class="rdv-component" role="region" aria-labelledby="upcoming-title">
    <p v-if="!loading && upcoming.length === 0" style="color:#6b7280;">Aucun rendez-vous à venir.</p>
    <RdvCardsComponent
      v-for="rdv in upcoming"
      :key="rdv.id_rendezvous"
      :profilePicture="rdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'"
      :nom="rdv.doctor_last_name"
      :prenom="rdv.doctor_first_name"
      :profession="rdv.profession"
      :operation="rdv.operation"
      :date="formatDateFr(rdv.starts_at)"
      :heure="formatTime(rdv.starts_at)"
      :adresse="rdv.address"
      :isPast="false"
      @details="openDetails(rdv, false)"
    />
  </div>

  <h2 id="history-title" tabindex="0" aria-label="Historique des rendez-vous">Historique</h2>
  <div class="rdv-component" role="region" aria-labelledby="history-title">
    <p v-if="!loading && past.length === 0" style="color:#6b7280;">Aucun rendez-vous passé.</p>
    <RdvCardsComponent
      v-for="rdv in past"
      :key="rdv.id_rendezvous"
      :profilePicture="rdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'"
      :nom="rdv.doctor_last_name"
      :prenom="rdv.doctor_first_name"
      :profession="rdv.profession"
      :operation="rdv.operation"
      :date="formatDateFr(rdv.starts_at)"
      :heure="formatTime(rdv.starts_at)"
      :adresse="rdv.address"
      :isPast="true"
      @details="openDetails(rdv, true)"
    />
  </div>

  <div
    v-if="isDetailsOpen && selectedRdv"
    role="dialog"
    aria-modal="true"
    aria-label="Détails du rendez-vous"
    style="position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;padding:14px;z-index:70;"
    @click.self="closeDetails"
  >
    <div
      style="background:#ffffff;border-radius:16px;max-width:560px;width:100%;padding:20px;max-height:90vh;overflow-y:auto;box-shadow:0 10px 25px rgba(0,0,0,0.2);"
    >
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;">
        <h3 id="rdv-modal-title" style="margin:0;font-size:18px;" tabindex="0">
          Détails du rendez-vous
        </h3>
        <button
          type="button"
          aria-label="Fermer le dialogue des détails"
          style="border:none;background:#e5e7eb;border-radius:999px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;"
          @click="closeDetails"
        >
          ✕
        </button>
      </div>

      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
        <img
          :src="selectedRdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'"
          :alt="`Photo de Dr. ${selectedRdv.doctor_first_name} ${selectedRdv.doctor_last_name}`"
          style="width:56px;height:56px;border-radius:50%;object-fit:cover;"
        />
        <div>
          <h4 style="margin:0 0 4px 0;font-size:16px;">
            Dr. {{ selectedRdv.doctor_first_name }} {{ selectedRdv.doctor_last_name }}
          </h4>
          <p style="margin:0 0 4px 0;font-size:13px;color:#4b5563;">
            {{ selectedRdv.profession }}
          </p>
          <p style="margin:0;font-size:13px;color:#111827;">
            {{ selectedRdv.operation }}
          </p>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#374151;">
        <p>
          <strong>Date :</strong>
          {{ formatDateFr(selectedRdv.starts_at) }} à {{ formatTime(selectedRdv.starts_at) }}
        </p>
        <p>
          <strong>Adresse :</strong>
          {{ selectedRdv.address }}
        </p>
        <p>
          <strong>Statut :</strong>
          {{ selectedIsPast ? 'Passé' : 'À venir' }}
        </p>
      </div>

      <p v-if="deleteError" style="margin:8px 0 0;color:#b91c1c;font-size:12px;" role="alert">{{ deleteError }}</p>

      <button
        type="button"
        style="margin-top:16px;width:100%;padding:10px;border:none;border-radius:10px;background:#fef2f2;color:#b91c1c;font-size:14px;font-weight:600;cursor:pointer;"
        @click="deleteRdv(selectedRdv.id_rendezvous)"
      >
        Supprimer ce rendez-vous
      </button>
    </div>
  </div>

</template>

<style scoped>
.rdv-component {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.rdv-page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
}

h2 {
    color: #333333;
    margin-top: 24px;
    margin-bottom: 16px;
    font-size: 20px;
}
</style>