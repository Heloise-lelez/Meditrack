<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  doctorProfile: {
    type: Object,
    required: true,
    default: () => ({ specialite: '', num_service: '', horaire_service: '' }),
  },
  saving: {
    type: Boolean,
    default: false,
  },
  saveError: {
    type: String,
    default: null,
  },
  saveSuccess: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'update:doctorProfile']);

const localProfile = ref({
  specialite: props.doctorProfile.specialite || '',
  num_service: props.doctorProfile.num_service || '',
  horaire_service: props.doctorProfile.horaire_service || '',
});

watch(
  () => props.doctorProfile,
  (newVal) => {
    if (newVal) {
      localProfile.value = {
        specialite: newVal.specialite || '',
        num_service: newVal.num_service || '',
        horaire_service: newVal.horaire_service || '',
      };
    }
  },
  { deep: true }
);

const infoFields = [
  {
    label: 'Spécialité',
    key: 'specialite',
    icon: 'fa-solid fa-stethoscope',
    placeholder: 'Ex: Chirurgie orthopédique',
    type: 'text',
  },
  {
    label: 'N° de service',
    key: 'num_service',
    icon: 'fa-solid fa-hospital',
    placeholder: '+0300000000',
    type: 'tel',
  },
  {
    label: 'Horaires',
    key: 'horaire_service',
    icon: 'fa-solid fa-clock',
    placeholder: 'Ex: Lun-Ven 8h-18h',
    type: 'text',
  },
];

async function handleSave() {
  emit('update:doctorProfile', localProfile.value);
  emit('save');
}
</script>

<template>
  <section class="card" aria-label="Informations professionnelles">
    <h2 class="card-title">Informations professionnelles</h2>

    <div v-if="saveSuccess" class="success-state">
      <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
      Informations enregistrées.
    </div>

    <div v-if="saveError" class="error-state">
      <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
      {{ saveError }}
    </div>

    <div class="doctor-edit-container">
      <div class="doctor-info">
        <div v-for="field in infoFields" :key="field.key" class="info-row">
          <span class="info-label"> <i :class="field.icon"></i> {{ field.label }} </span>

          <div class="input-wrapper">
            <input
              :id="field.key"
              v-model="localProfile[field.key]"
              class="info-input"
              :type="field.type"
              :placeholder="field.placeholder"
              :disabled="saving"
            />
            <i v-if="!saving" class="fa-solid fa-pen edit-icon" aria-hidden="true"></i>
          </div>
        </div>

        <div class="info-row action-row">
          <span class="info-label"></span>
          <button class="save-btn" :disabled="saving" @click="handleSave">
            <span v-if="saving" class="mini-spinner-inline" aria-hidden="true"></span>
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
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

.success-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: var(--color-success-text, #155724);
  background: var(--color-success-bg, #d4edda);
  border: 1px solid var(--color-success, #c3e6cb);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
}

.error-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: var(--color-error-text, #721c24);
  background: var(--color-error-bg, #f8d7da);
  border: 1px solid var(--color-error, #f5c6cb);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
}

.doctor-edit-container {
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-md);
  background-color: var(--color-off-white);
  overflow: hidden;
}

.doctor-info {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-gray-light);
  gap: 16px;
  transition: background-color 0.2s ease;
}

.info-row:hover:not(.action-row) {
  background-color: rgba(255, 255, 255, 0.6);
}

.info-label {
  width: 110px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-gray-dark);
  font-weight: 500;
  white-space: nowrap;
  font-size: 14px;
  flex-shrink: 0;
}

.info-label i {
  font-size: 14px;
  color: var(--color-primary);
}

.input-wrapper {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  position: relative;
}

.info-input {
  width: 100%;
  max-width: 250px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  color: var(--color-black);
  font-weight: 500;
  text-align: right;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.info-input:hover:not(:disabled) {
  border-color: var(--color-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-background);
  background: var(--color-white);
}

.info-input::placeholder {
  color: var(--color-gray);
  font-weight: 400;
  font-style: italic;
}

.info-input:disabled {
  background: var(--color-gray-light);
  color: var(--color-gray);
  cursor: not-allowed;
  border-color: transparent;
}

.edit-icon {
  color: var(--color-primary);
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.info-input:hover + .edit-icon,
.info-input:focus + .edit-icon {
  opacity: 1;
}

.action-row {
  background: var(--color-white);
  justify-content: flex-end;
  padding: 16px 20px;
  border-bottom: none;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.mini-spinner-inline {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-row:hover:not(.action-row) {
    background-color: transparent;
  }

  .info-label {
    width: 100%;
  }

  .input-wrapper {
    justify-content: flex-start;
    width: 100%;
  }

  .info-input {
    max-width: 100%;
    text-align: left;
  }

  .edit-icon {
    display: none;
  }

  .action-row {
    justify-content: stretch;
  }

  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
