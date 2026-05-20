<script setup>
import { ROLES } from '@/constants/roles.js';
import { computed, ref } from 'vue';
import { api } from '@/lib/api.js';

const props = defineProps({
  user: { type: Object, required: true },
  userRole: { type: String, required: true },
  loggingOut: { type: Boolean, default: false },
  logoutError: { type: String, default: null },
});
defineEmits(['sign-out']);

const lastName = computed(() => props.user.user_metadata?.nom ?? '');
const firstName = computed(() => props.user.user_metadata?.prenom ?? '');
const isAccompanied = ref(props.user.user_metadata?.is_accompanied ?? false);
const togglingAccompanied = ref(false);

const displayName = computed(() => {
  const full = [firstName.value, lastName.value].filter(Boolean).join(' ');
  return full || props.user.value?.email || '';
});

const initials = computed(() => {
  const p = firstName.value[0] ?? '';
  const n = lastName.value[0] ?? '';
  if (p || n) return (p + n).toUpperCase();
  return props.user.value?.email?.[0]?.toUpperCase() || '?';
});

const infoProfile = [
  { label: 'Email', value: props.user.email },
  ...(props.user.user_metadata?.tel
    ? [{ label: 'Téléphone', value: props.user.user_metadata.tel }]
    : []),
];

const toggleAccompanied = async () => {
  togglingAccompanied.value = true;
  try {
    await api.put(`/api/profile/update/${props.user.id}`, {
      is_accompanied: !isAccompanied.value,
    });
    isAccompanied.value = !isAccompanied.value;
  } catch (err) {
    console.error(err);
  } finally {
    togglingAccompanied.value = false;
  }
};
</script>

<template>
  <aside class="profile-sidebar">
    <div class="profile-card">
      <div class="avatar" aria-hidden="true">{{ initials }}</div>
      <h2 class="profile-name">{{ displayName }}</h2>
      <span class="profile-role">{{ userRole }}</span>
    </div>

    <div class="info-section" aria-label="Informations personnelles">
      <div class="info-row" v-for="info in infoProfile" :key="info.label">
        <span class="info-label">{{ info.label }}</span>
        <span class="info-value">{{ info.value }}</span>
      </div>
      <div class="accompagnement-row" v-if="userRole === ROLES.PATIENT">
        <div class="accompagnement-label">
          <i class="fa-solid fa-people-arrows"></i>
          <div>
            <span class="accompagnement-title">Accompagnant</span>
            <p class="accompagnement-hint">Besoin d'être accompagné(e) aux rendez-vous</p>
          </div>
        </div>
        <button
          :class="['toggle', { active: isAccompanied }]"
          :disabled="togglingAccompanied"
          @click="toggleAccompanied"
          :aria-label="isAccompanied ? 'Désactiver l\'accompagnant' : 'Activer l\'accompagnant'"
        >
          <span class="toggle-thumb"></span>
          <span class="toggle-label">{{ isAccompanied ? 'Oui' : 'Non' }}</span>
        </button>
      </div>
    </div>

    <router-link
      v-if="userRole === ROLES.PATIENT"
      to="/documents"
      class="documents-btn"
      aria-label="Accéder à mes documents"
    >
      <i class="fa-solid fa-file" aria-hidden="true"></i>
      Mes documents
    </router-link>

    <p v-if="logoutError" class="logout-error" role="alert">{{ logoutError }}</p>

    <button
      class="logout-btn"
      aria-label="Se déconnecter"
      :disabled="loggingOut"
      @click="$emit('sign-out')"
    >
      {{ loggingOut ? 'Déconnexion…' : 'Se déconnecter' }}
    </button>
  </aside>
</template>

<style scoped>
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-md);
  text-align: center;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  margin: 0;
  font-size: 18px;
  color: var(--color-black);
}

.profile-role {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-white);
  background: var(--color-primary);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  font-size: 14px;
  border-bottom: 1px solid var(--color-gray-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--color-gray);
  font-weight: 500;
}
.info-value {
  color: var(--color-black);
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.accompagnement-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  gap: 12px;
  background: var(--color-primary-50);
  border-top: 1px solid var(--color-primary-100);
  border-bottom: 1px solid var(--color-primary-100);
}

.accompagnement-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.accompagnement-label > i {
  font-size: 18px;
  color: var(--color-primary);
}

.accompagnement-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-black);
}

.accompagnement-hint {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--color-gray);
}

/* Toggle */
.toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-gray-light);
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle.active {
  background: var(--color-primary);
}
.toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-white);
  transition: transform 0.2s ease;
  order: 2;
}

.toggle.active .toggle-thumb {
  transform: translateX(4px);
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-dark);
  min-width: 24px;
  order: 1;
}

.toggle.active .toggle-label {
  color: var(--color-white);
}

/* Boutons sidebar */
.documents-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-primary-background);
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;
}

.documents-btn:hover {
  background: var(--color-primary-hover);
  color: var(--color-white);
}

.logout-error {
  color: var(--color-error);
  margin: 0;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-error-bg);
  color: var(--color-error);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover:not(:disabled) {
  background: var(--color-error);
  color: var(--color-error-bg);
}
</style>
