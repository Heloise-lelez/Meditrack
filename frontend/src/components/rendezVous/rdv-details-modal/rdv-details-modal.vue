<script setup>
import { ref, watch } from 'vue';
import { api } from '../../../lib/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  rdv: {
    type: Object,
    default: null,
  },
  isPast: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'deleted', 'updated']);

const deleteError = ref(null);
const checklistItems = ref([]);

// Initialiser l'état de la checklist quand le RDV change
watch(
  () => props.rdv,
  (newRdv) => {
    if (newRdv && newRdv.checklist) {
      checklistItems.value = newRdv.checklist.map((item) => ({
        ...item,
        fait: item.fait || false,
      }));
    }
  },
  { immediate: true }
);

const close = () => {
  deleteError.value = null;
  emit('close');
};

const deleteRdv = async (id) => {
  if (!confirm('Êtes vous sûr de vouloir supprimer ce rendez-vous ?')) return;
  deleteError.value = null;
  try {
    await api.delete(`/api/rendezvous/${id}`);
    close();
    emit('deleted');
  } catch (err) {
    console.error(err);
    deleteError.value = 'Impossible de supprimer ce rendez-vous.';
  }
};

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

const toggleChecklistItem = async (index) => {
  const previousValue = checklistItems.value[index].fait;
  checklistItems.value[index].fait = !previousValue;
  try {
    await api.put(`/api/rendezvous/${props.rdv.id_rendezvous}`, {
      checklist: checklistItems.value,
    });
    // Émettre l'événement pour mettre à jour la card
    emit('updated', {
      id: props.rdv.id_rendezvous,
      checklist: checklistItems.value,
    });
  } catch (err) {
    // Revert on failure
    console.error('Erreur mise à jour checklist:', err);
    checklistItems.value[index].fait = previousValue;
  }
};
</script>

<template>
  <div
    v-if="isOpen && rdv"
    role="dialog"
    aria-modal="true"
    aria-label="Détails du rendez-vous"
    class="rdv__details"
    @click.self="close"
  >
    <div class="rdv__modal-content">
      <div class="rdv__modal-header">
        <h3 id="rdv-modal-title" class="rdv__modal-title" tabindex="0">Détails du rendez-vous</h3>
        <button
          type="button"
          aria-label="Fermer le dialogue des détails"
          class="rdv__close-btn"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="rdv__doctor-info">
        <img
          :src="rdv.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg'"
          :alt="`Photo de Dr. ${rdv.doctor_first_name} ${rdv.doctor_last_name}`"
          class="rdv__doctor-picture"
        />
        <div>
          <h4 class="rdv__doctor-name">
            Dr. {{ rdv.doctor_first_name }} {{ rdv.doctor_last_name }}
          </h4>
          <p class="rdv__doctor-profession">
            {{ rdv.profession }}
          </p>
        </div>
      </div>

      <div class="rdv__details-list">
        <div class="rdv__doctor-operation">
          <i class="fa-solid fa-stethoscope"></i>
          {{ rdv.operation }}
        </div>
        <div>
          <i class="fa-solid fa-calendar"></i>
          {{ formatDateFr(rdv.starts_at) }} à {{ formatTime(rdv.starts_at) }}
        </div>
        <div>
          <i class="fa-solid fa-map-marker-alt"></i>
          {{ rdv.address }}
        </div>
        <div class="rdv__checklist-container">
          <div v-if="checklistItems && checklistItems.length > 0">
            <strong
              >{{ checklistItems.length }} tâche{{ checklistItems.length > 1 ? 's' : '' }} à faire
              avant le rendez-vous :</strong
            >
            <ul class="rdv__checklist">
              <li
                v-for="(item, index) in checklistItems"
                :key="index"
                class="rdv__checklist-item"
                :class="{ 'rdv__checklist-item--done': item.fait }"
              >
                <input
                  type="checkbox"
                  :id="`checklist-${index}`"
                  :checked="item.fait"
                  @change="toggleChecklistItem(index)"
                  class="rdv__checkbox"
                  :aria-label="`${item.label} - ${item.fait ? 'Complété' : 'À faire'}`"
                />
                <label :for="`checklist-${index}`" class="rdv__checkbox-label">
                  {{ item.label }}
                </label>
                <span class="rdv__checkbox-item-status">
                  {{ item.fait ? 'Fait' : 'À faire' }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p v-if="deleteError" class="rdv__delete-error" role="alert">
        {{ deleteError }}
      </p>
      <button type="button" class="rdv__delete-btn" @click="deleteRdv(rdv.id_rendezvous)">
        <i class="fa-solid fa-trash"></i>
        <p>Supprimer ce rendez-vous</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
.rdv__details {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  z-index: 70;
}

.rdv__modal-content {
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  border-radius: 16px;
  max-width: 560px;
  width: 100%;
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  gap: 16px;
}

.rdv__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.rdv__modal-title {
  margin: 0;
  font-size: 18px;
}

.rdv__close-btn {
  border: none;
  background: #e5e7eb;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rdv__doctor-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.rdv__doctor-picture {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.rdv__doctor-name {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.rdv__doctor-profession {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #4b5563;
}

.rdv__doctor-operation {
  margin: 0;
  font-size: 16px;
  color: var(--color-secondary);
  font-weight: 600;
}

.rdv__details-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 16px;
  color: #374151;
}

.rdv__delete-error {
  margin: 8px 0 0;
  color: #b91c1c;
  font-size: 16px;
}

.rdv__modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.rdv__delete-btn {
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

  background: var(--color-error-bg);
  color: var(--color-error-text);
  border: 1px solid var(--color-error);
}

.rdv__checklist-container {
  margin-top: 16px;
  background-color: var(--color-primary-background);
  padding: 16px;
  border-radius: 10px;
}

.rdv__checklist-container strong {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #374151;
}

.rdv__checklist {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rdv__checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-white);
  border-radius: 8px;
  border-left: 3px solid var(--color-white);
  transition: all 0.2s ease;
  min-height: 48px;
}

.rdv__checklist-item:hover {
  border-left-color: var(--color-secondary);
}

.rdv__checklist-item.rdv__checklist-item--done {
  background: #ecfdf5;
  border-left-color: rgba(16, 185, 129, 0.6);
}

.rdv__checklist-item.rdv__checklist-item--done:hover {
  background: #d1fae5;
}

.rdv__checkbox {
  width: 24px;
  height: 24px;
  min-width: 24px;
  cursor: pointer;
  accent-color: #10b981;
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rdv__checkbox:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.rdv__checkbox:checked {
  background: rgba(16, 185, 129, 0.6);
  border-color: rgb(16, 185, 129);
}

.rdv__checkbox:checked::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: 700;
}

.rdv__checkbox:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.rdv__checkbox-label {
  cursor: pointer;
  font-size: 16px;
  color: #374151;
  flex: 1;
  transition: all 0.2s ease;
}

.rdv__checkbox-item-status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid #d1d5db;
}

.rdv__checklist-item.rdv__checklist-item--done .rdv__checkbox-label {
  color: #6b7280;
  text-decoration: line-through;
  opacity: 0.8;
}

.rdv__checklist-item.rdv__checklist-item--done .rdv__checkbox-item-status {
  background: rgba(16, 185, 129, 0.2);
  color: rgb(16, 185, 129);
  border-color: rgb(16, 185, 129);
}

/* Respect de prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .rdv__checklist-item,
  .rdv__checkbox,
  .rdv__checkbox-label {
    transition: none;
  }
}
</style>
