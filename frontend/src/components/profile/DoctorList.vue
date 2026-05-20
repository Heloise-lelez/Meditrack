<script setup>
import { onMounted, ref } from 'vue';
import { api } from '@/lib/api.js';

const myDoctors = ref([]);
const loadingDoctors = ref(false);

onMounted(async () => {
  loadingDoctors.value = true;
  try {
    myDoctors.value = await api.get('/api/profile/my-doctors');
  } finally {
    loadingDoctors.value = false;
  }
});

const getInitials = (doctor) => {
  const p = doctor.prenom?.[0] ?? '';
  const n = doctor.nom?.[0] ?? '';
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
    <h3 class="card-title">Mes médecins</h3>

    <div v-if="loadingDoctors" class="loading-state">
      <div class="mini-spinner" aria-hidden="true"></div>
    </div>

    <p v-else-if="myDoctors.length === 0" class="empty-state">
      <i class="fa-solid fa-user-doctor" aria-hidden="true"></i>
      Aucun médecin assigné.
    </p>

    <div v-else class="doctors-list">
      <div v-for="doctor in myDoctors" :key="doctor.id" class="doctor-card">
        <div class="doctor-header">
          <div class="doctor-avatar">{{ getInitials(doctor) }}</div>
          <div class="doctor-identity">
            <p class="doctor-name">Dr. {{ doctor.prenom }} {{ doctor.nom }}</p>
            <span v-if="doctor.specialite" class="doctor-speciality">{{ doctor.specialite }}</span>
          </div>
        </div>
        <div class="doctor-info">
          <template v-for="field in infoDoctor" :key="field.key">
            <div v-if="doctor[field.key]" class="info-row">
              <span class="info-label"> <i :class="field.icon"></i> {{ field.label }} </span>
              <a
                v-if="field.href"
                :href="field.href(doctor[field.key])"
                class="info-value info-link"
              >
                {{ doctor[field.key] }}
              </a>
              <span v-else class="info-value">{{ doctor[field.key] }}</span>
            </div>
          </template>
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

.doctor-card:last-child {
  border-bottom: none;
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
  gap: 4px;
}

.doctor-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-black);
}

.doctor-speciality {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-white);
  background: var(--color-primary);
  padding: 2px 8px;
  border-radius: var(--radius-md);
  width: fit-content;
}

.doctor-info {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid var(--color-gray-light);
  gap: 12px;
}

.info-label {
  width: 100px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray-dark);
  font-weight: 500;
  white-space: nowrap;
}

.info-label i {
  font-size: 12px;
}

.info-value {
  color: var(--color-black);
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.info-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.info-link:hover {
  color: var(--color-primary-dark);
}
</style>
