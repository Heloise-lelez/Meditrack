<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/lib/api.js';

const { userRole } = useAuth();

const isPatient = computed(() => userRole.value === 'PATIENT');

const HOTLINES = [
  { number: '3114', label: 'Prévention Suicide' },
  { number: '3919', label: 'Violences Femmes Info' },
  { number: '15', label: 'Samu Urgence Médicale' },
  { number: '114', label: 'Urgence SMS' },
  { number: '0972394050', label: 'Sos Amitié' },
  { number: '0145394000', label: 'Suicide Écoute' },
  { number: '119', label: 'Enfance en Danger' },
  { number: '3977', label: 'Maltraitance Vulnérables' },
  { number: '0800200000', label: 'Fil Santé Jeunes' },
];

const doctors = ref([]);
const loadingDoctors = ref(false);
const errorDoctors = ref(null);

onMounted(async () => {
  if (!isPatient.value) return;
  loadingDoctors.value = true;
  try {
    doctors.value = await api.get('/api/profile/my-doctors');
  } catch {
    errorDoctors.value = 'Impossible de charger vos médecins.';
  } finally {
    loadingDoctors.value = false;
  }
});
</script>

<template>
  <div class="contact-page" aria-label="Page de contact">
    <div class="contact-section" aria-labelledby="hotlines-title">
      <h2 id="hotlines-title">Numéros utiles</h2>
      <ul class="hotlines-grid" role="list">
        <li v-for="h in HOTLINES" :key="h.number" class="hotline-card">
          <a
            :href="`tel:${h.number}`"
            class="hotline-number"
            :aria-label="`Appeler le ${h.number} — ${h.label}`"
          >
            {{ h.number }}
          </a>
          <span class="hotline-label">{{ h.label }}</span>
        </li>
      </ul>
    </div>

    <div v-if="isPatient" class="contact-section" aria-labelledby="doctors-title">
      <h2 id="doctors-title">Mes médecins</h2>

      <p v-if="loadingDoctors" class="state-message">Chargement…</p>
      <p v-else-if="errorDoctors" class="state-message state-error">{{ errorDoctors }}</p>
      <p v-else-if="doctors.length === 0" class="state-message">
        Aucun médecin assigné pour le moment.
      </p>

      <ul v-else class="doctors-list" role="list">
        <li v-for="doc in doctors" :key="doc.id" class="doctor-card">
          <div class="doctor-header">
            <span class="doctor-name">{{ doc.prenom }} {{ doc.nom }}</span>
            <span v-if="doc.specialite" class="doctor-specialite">{{ doc.specialite }}</span>
          </div>
          <div class="doctor-contacts">
            <a v-if="doc.tel" :href="`tel:${doc.tel}`" class="contact-link">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
              {{ doc.tel }}
            </a>
            <a v-if="doc.email" :href="`mailto:${doc.email}`" class="contact-link">
              <i class="fa-solid fa-envelope" aria-hidden="true"></i>
              {{ doc.email }}
            </a>
            <span v-if="!doc.tel && !doc.email" class="no-contact"
              >Aucune coordonnée renseignée</span
            >
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Hotlines */
.hotlines-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.hotline-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.hotline-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
}

.hotline-number:hover,
.hotline-number:focus {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.hotline-label {
  font-size: 0.85rem;
  color: var(--color-gray-dark);
}

/* Doctors */
.doctors-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.doctor-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.doctor-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.doctor-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-gray-dark);
}

.doctor-specialite {
  font-size: 0.85rem;
  color: var(--color-gray-dark);
  opacity: 0.7;
}

.doctor-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: var(--color-primary);
  text-decoration: none;
}

.contact-link:hover,
.contact-link:focus {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.no-contact {
  font-size: 0.85rem;
  color: var(--color-gray-dark);
  opacity: 0.6;
}

.state-message {
  font-size: 0.95rem;
  color: var(--color-gray-dark);
}

.state-error {
  color: var(--color-error, #c0392b);
}

@media (max-width: 768px) {
  .hotlines-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

.hotline-number:focus-visible,
.contact-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
