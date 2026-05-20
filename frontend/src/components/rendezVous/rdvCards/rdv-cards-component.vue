<script setup>
import { computed } from 'vue';
import './rdvCards.css';

const props = defineProps({
  profilePicture: { type: String, default: '' },
  nom: { type: String, default: '' },
  prenom: { type: String, default: '' },
  profession: { type: String, default: '' },
  operation: { type: String, default: '' },
  date: { type: String, default: '' },
  heure: { type: String, default: '' },
  adresse: { type: String, default: '' },
  isPast: { type: Boolean, default: false },
  checklist: { type: Array, default: [] },
});

const emit = defineEmits(['details']);

// Compter les tâches non complétées
const incompleteTasks = computed(() => {
  return props.checklist.filter((task) => !task.fait).length;
});
</script>

<template>
  <div
    class="rdv-cards"
    v-if="!isPast"
    role="article"
    :aria-label="`Rendez-vous avec Dr. ${prenom} ${nom}`"
  >
    <div class="card-header">
      <img :src="profilePicture" :alt="`Photo de Dr. ${prenom} ${nom}`" class="profile-picture" />
      <div class="user-info">
        <h2 tabindex="0">Dr. {{ prenom }} {{ nom }}</h2>
        <p>{{ profession }}</p>
      </div>
    </div>
    <div class="card__info"><i class="fa-solid fa-stethoscope"></i> {{ operation }}</div>
    <div class="date-time">
      <div class="card__info"><i class="fa-solid fa-calendar"></i> {{ date }}</div>
      <div class="card__info"><i class="fa-solid fa-clock"></i> {{ heure }}</div>
    </div>
    <div class="card__info"><i class="fa-solid fa-house-medical"></i> {{ adresse }}</div>
    <div :class="`card__info ${incompleteTasks > 0 ? 'warning' : 'success'}`">
      <i v-if="incompleteTasks > 0" class="fa-solid fa-circle-exclamation"></i>
      <i v-else class="fa-solid fa-list-check"></i>
      <div v-if="incompleteTasks > 0">
        {{ incompleteTasks }} tâche(s) restantes à faire avant le rendez-vous
      </div>
      <div v-else>Aucune tâche à faire avant le rendez-vous</div>
    </div>
    <button
      class="details-button"
      type="button"
      aria-label="Voir les détails du rendez-vous"
      @click="emit('details')"
    >
      Voir les détails
    </button>
  </div>

  <div
    class="rdv-cards-past"
    v-if="isPast"
    role="article"
    :aria-label="`Rendez-vous passé avec Dr. ${prenom} ${nom}`"
  >
    <img :src="profilePicture" :alt="`Photo de Dr. ${prenom} ${nom}`" class="profile-picture" />
    <div class="user-info-past">
      <h2 tabindex="0">Dr. {{ prenom }} {{ nom }}</h2>
      <p>{{ profession }}</p>
      <div class="card__info"><i class="fa-solid fa-stethoscope"></i> {{ operation }}</div>
      <div class="card__info">
        <i class="fa-solid fa-calendar"></i> {{ date }} <i class="fa-solid fa-clock"></i>
        {{ heure }}
      </div>
      <p><i class="fa-solid fa-house-medical"></i> {{ adresse }}</p>
    </div>
  </div>
</template>

<style scoped>
.rdv-cards {
  position: relative;
  width: 400px;
  background: linear-gradient(
    135deg,
    var(--color-primary-background) 0%,
    var(--color-secondary-background) 100%
  );
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1px solid #e8eef2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition:
    all 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s ease-out;
}

.rdv-cards:hover {
  border-color: var(--color-primary);
  box-shadow: 0 12px 24px rgba(15, 39, 34, 0.12);
}

.card-header {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f3f6;
}

.profile-picture {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary-light);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(15, 39, 34, 0.1);
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0 0 4px 0;
  color: #0f2722;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.user-info p {
  margin: 0;
  font-size: 13px;
  color: #6b7580;
  font-weight: 500;
}

.date-time {
  display: flex;
  gap: 16px;
}

.card__info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #364047;
  font-weight: 500;
  padding: 12px;
  background: #f8fafb;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.card__info i {
  color: var(--color-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.card__info:hover {
  background: #f0f3f6;
}

.card__info.warning {
  background: #fff5f0;
  color: var(--color-warning-text);
  font-weight: 600;
}

.card__info.warning i {
  color: var(--color-warning-text);
  animation: pulse 2s infinite;
}

.card__info.success {
  background: #f0f9f4;
  color: var(--color-success-text);
  font-weight: 600;
}

.card__info.success i {
  color: var(--color-success-text);
}
.details-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;

  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  background: var(--color-secondary-background);
  color: var(--color-secondary);
  border: 1px solid var(--color-secondary);
}

/* Carte passée */
.rdv-cards-past {
  position: relative;
  width: 90%;
  background: #f5f7fa;
  border: 1px solid #e0e4e9;
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  opacity: 0.85;
  transition: all 0.2s ease;
}

.rdv-cards-past:hover {
  background: #eff2f7;
}

.profile-picture {
  flex-shrink: 0;
}

.user-info-past {
  flex: 1;
}

.user-info-past h2 {
  margin: 0 0 4px 0;
  color: #364047;
  font-size: 18px;
  font-weight: 700;
  text-decoration-color: #b0b5bb;
  opacity: 0.8;
}

.user-info-past p {
  margin: 6px 0;
  font-size: 13px;
  color: #6b7580;
  font-weight: 500;
}

.alert-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background-color: #fff5f0;
  border-left: 4px solid #d32f2f;
  border-radius: 8px;
  color: #d32f2f;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
}

.alert-banner i {
  flex-shrink: 0;
  font-size: 18px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .rdv-cards {
    width: 100%;
  }

  .user-info h2 {
    font-size: 18px;
  }

  .date-time {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
