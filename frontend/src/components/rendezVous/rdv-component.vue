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

// État des dropdowns
const isUpcomingOpen = ref(true);
const isHistoryOpen = ref(false);
</script>

<template>
  <div class="rdv-page">
    <h1 class="rdv-title">Vos rendez-vous</h1>

    <p v-if="loading">Chargement…</p>
    <p v-else-if="errorMessage">
      {{ errorMessage }}
    </p>

    <!-- Dropdown À venir -->
    <div class="rdv-dropdown">
      <button
        class="rdv-dropdown-button"
        :aria-expanded="isUpcomingOpen"
        @click="isUpcomingOpen = !isUpcomingOpen"
      >
        <span class="rdv-dropdown-title">À venir</span>
        <i :class="['fa-solid', isUpcomingOpen ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
      <div v-show="isUpcomingOpen" class="rdv-dropdown-content">
        <div class="rdv-component" role="region" aria-labelledby="upcoming-title">
          <p v-if="!loading && upcoming.length === 0" class="rdv__empty-message">
            Aucun rendez-vous à venir.
          </p>
          <RdvCardsComponent
            v-for="rdv in upcoming"
            :key="rdv.id_rendezvous"
            :profilePicture="
              rdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'
            "
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
      </div>
    </div>

    <!-- Dropdown Historique -->
    <div class="rdv-dropdown">
      <button
        class="rdv-dropdown-button"
        :aria-expanded="isHistoryOpen"
        @click="isHistoryOpen = !isHistoryOpen"
      >
        <span class="rdv-dropdown-title">Historique</span>
        <i :class="['fa-solid', isHistoryOpen ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
      <div v-show="isHistoryOpen" class="rdv-dropdown-content">
        <div class="rdv-component" role="region" aria-labelledby="history-title">
          <p v-if="!loading && past.length === 0" class="rdv__empty-message">
            Aucun rendez-vous passé.
          </p>
          <RdvCardsComponent
            v-for="rdv in past"
            :key="rdv.id_rendezvous"
            :profilePicture="
              rdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'
            "
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
      </div>
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
  margin: 0;
}

.rdv-dropdown {
  border: 1px solid #e8eef2;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.rdv-dropdown-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafb 0%, #f0f3f6 100%);
  border: none;
  cursor: pointer;
  font-size: 18px;
  font-weight: 600;
  color: #0f2722;
  transition: all 0.3s ease;
}

.rdv-dropdown-button:hover {
  background: linear-gradient(135deg, #f0f3f6 0%, #e8eef2 100%);
}

.rdv-dropdown-button:active {
  background: linear-gradient(135deg, #e8eef2 0%, #dfe5eb 100%);
}

.rdv-dropdown-title {
  flex: 1;
  text-align: left;
}

.rdv-dropdown-button i {
  color: var(--color-primary);
  font-size: 16px;
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.rdv-dropdown-content {
  padding: 20px;
  background: white;
  animation: slideDown 0.3s ease-out;
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

.rdv__empty-message {
  color: #6b7280;
  text-align: center;
  padding: 20px;
  width: 100%;
}
</style>
