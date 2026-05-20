<script setup>
import { computed, onMounted, ref } from 'vue';
import './rdv.css';
import RdvCardsComponent from './rdvCards/rdv-cards-component.vue';
import RdvDetailsModal from './rdv-details-modal/rdv-details-modal.vue';
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
    errorMessage.value = 'Impossible de charger les rendez-vous.';
    rdvs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRdvs();
});

const now = () => new Date();

const upcoming = computed(() => rdvs.value.filter((r) => new Date(r.starts_at) >= now()));

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

const openDetails = (rdv, isPast) => {
  selectedRdv.value = rdv;
  selectedIsPast.value = isPast;
  isDetailsOpen.value = true;
};

const closeDetails = () => {
  isDetailsOpen.value = false;
  selectedRdv.value = null;
  selectedIsPast.value = false;
};

const handleRdvDeleted = async () => {
  await loadRdvs();
};
</script>

<template>
  <div class="rdv-page">
    <h1 class="rdv-title">Vos rendez-vous</h1>

    <p v-if="loading">Chargement…</p>
    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <h2 class="rdv-subtitle" tabindex="0" aria-label="Rendez vous à venir">À venir :</h2>
    <div class="rdv-component" role="region" aria-labelledby="upcoming-title">
      <p v-if="!loading && upcoming.length === 0" class="rdv__empty-message">
        Aucun rendez-vous à venir.
      </p>
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
        :checklist="rdv.checklist || []"
        @details="openDetails(rdv, false)"
      />
    </div>

    <h2 id="history-title" tabindex="0" aria-label="Historique des rendez-vous">Historique</h2>
    <div class="rdv-component" role="region" aria-labelledby="history-title">
      <p v-if="!loading && past.length === 0" class="rdv__empty-message">
        Aucun rendez-vous passé.
      </p>
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

    <RdvDetailsModal
      :is-open="isDetailsOpen"
      :rdv="selectedRdv"
      :is-past="selectedIsPast"
      @close="closeDetails"
      @deleted="handleRdvDeleted"
    />
  </div>
</template>

<style scoped>
.rdv-page {
  margin: 0 auto;
  padding: 0 14px;
  display: flex;
  flex-direction: column;

  gap: 16px;
}
.rdv-component {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.rdv-title {
  font-size: 24px;
}
.rdv-subtitle {
  font-size: 20px;
}

.rdv__empty-message {
  color: #6b7280;
}
</style>
