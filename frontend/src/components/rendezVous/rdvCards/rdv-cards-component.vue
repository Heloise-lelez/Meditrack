<script setup>
import './rdvCards.css';

defineProps({
  profilePicture: { type: String, default: '' },
  nom: { type: String, default: '' },
  prenom: { type: String, default: '' },
  profession: { type: String, default: '' },
  operation: { type: String, default: '' },
  date: { type: String, default: '' },
  heure: { type: String, default: '' },
  adresse: { type: String, default: '' },
  isPast: { type: Boolean, default: false },
});

const emit = defineEmits(['details']);
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
        <p>{{ operation }}</p>
      </div>
    </div>
    <p>{{ date }}</p>
    <p>{{ heure }}</p>
    <p>{{ adresse }}</p>
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
      <p>{{ operation }}</p>
      <p>{{ date }} à {{ heure }}</p>
    </div>
  </div>
</template>

<style scoped>
.rdv-cards {
  position: relative;
  width: 90%;
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 18px 20px 24px;
  box-shadow: 0 8px 20px rgba(15, 39, 34, 0.2);
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.profile-picture {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  padding: 6px;
}

.user-info h2 {
  margin: 0;
  color: #0f2722;
  font-size: 18px;
  font-weight: 600;
}

.user-info p {
  margin: 2px 0;
  font-size: 14px;
  color: #2d2e2e;
}

.user-info p:nth-of-type(2) {
  color: #3a8d7a;
  font-size: 14px;
}

.rdv-cards > p {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 6px;
  font-size: 14px;
  color: #2d2e2e;
}

.details-button {
  display: block;
  width: 90%;
  margin: 12px auto;
  padding: 12px 16px;
  border-radius: 10px;
  background-color: #baf8f5;
  border: none;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  cursor: pointer;
}

.rdv-cards-past {
  position: relative;
  width: 90%;
  background: #ffffff;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  padding: 18px 18px 20px 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-info-past h2 {
  margin: 0;
  color: #0f2722;
  font-size: 18px;
  font-weight: 600;
}

.user-info-past p {
  margin: 2px 0;
  font-size: 14px;
  color: #2d2e2e;
}
</style>
