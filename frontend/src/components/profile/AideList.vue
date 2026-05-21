<script setup>
import { onMounted, ref } from 'vue';
import { api } from '@/lib/api.js';

const myDoctors = ref([]);
const myAides = ref([]);
const loadingDoctors = ref(false);
const loadingAides = ref(false);

onMounted(async () => {
  loadingDoctors.value = true;
  try {
    myDoctors.value = await api.get('/api/profile/my-doctors');
    myAides.value = await api.get('/api/profile/my-aides');

    console.log(myAides.value);
  } finally {
    loadingDoctors.value = false;
    loadingAides.value = false;
  }
});

const getInitials = (aide) => {
  const p = aide.profiles.prenom?.[0] ?? '';
  const n = aide.profiles.nom?.[0] ?? '';
  return (p + n).toUpperCase() || '?';
};

const infoDoctor = [
  { label: 'Email', key: 'email', icon: 'fa-solid fa-envelope', href: (v) => `mailto:${v}` },
  { label: 'Téléphone', key: 'tel', icon: 'fa-solid fa-phone', href: (v) => `tel:${v}` },
  { label: 'N° de service', key: 'num_service', icon: 'fa-solid fa-hospital', href: null },
  { label: 'Horaires', key: 'horaire_service', icon: 'fa-solid fa-clock', href: null },
];
</script>

<template>
  <section class="card" aria-label="Mes médecins">
    <h2 class="card-title">Mes aides</h2>

    <div v-if="loadingDoctors" class="loading-state">
      <div class="mini-spinner" aria-hidden="true"></div>
    </div>

    <p v-else-if="myAides.length === 0" class="empty-state">
      <i class="fa-solid fa-user-doctor" aria-hidden="true"></i>
      Aucun aide assigné
    </p>

    <div v-else class="doctors-list">
      <div v-for="aide in myAides" :key="aide.id" class="doctor-card">
        <div class="doctor-header">
          <div class="doctor-avatar">{{ getInitials(aide) }}</div>
          <div class="doctor-identity">
            <p class="doctor-name">Dr. {{ aide.profiles.prenom }} {{ aide.profiles.nom }}</p>
            <a v-if="aide.profiles.tel" :href="`tel:${aide.profiles.tel}`" class="contact-link">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
              {{ aide.profiles.tel }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-title {
  margin: 0;
  font-weight: 600;
  color: var(--color-primary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 28px 20px;
  color: var(--color-warning-text);
  background: var(--color-warning-bg);
  font-size: 14px;
}

.empty-state i {
  font-size: 24px;
  color: var(--color-warning);
}

.doctors-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-card {
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-md);
  background-color: var(--color-off-white);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px 12px;
}

.doctor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-primary-background);
  color: var(--color-primary-dark);
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doctor-identity {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doctor-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-black);
}

.info-label i {
  font-size: 12px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
  color: var(--color-primary-dark);
}
</style>
