<template>
  <main class="profile-page" role="main" aria-label="Page profil">
    <header class="profile-header">
      <h1>Chirurgie Suivi</h1>
      <p>Mon profil</p>
    </header>

    <div class="profile-card">
      <div class="avatar" aria-hidden="true">{{ initials }}</div>
      <h2 class="profile-name" tabindex="0">{{ displayName }}</h2>
    </div>

    <section class="info-section" aria-label="Informations personnelles">
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">{{ user.email }}</span>
      </div>
      <div class="info-row" v-if="tel">
        <span class="info-label">Téléphone</span>
        <span class="info-value">{{ tel }}</span>
      </div>
    </section>

    <p v-if="logoutError" class="logout-error" role="alert">{{ logoutError }}</p>

    <button class="logout-btn" aria-label="Se déconnecter" :disabled="loggingOut" @click="handleSignOut">
      {{ loggingOut ? 'Déconnexion…' : 'Se déconnecter' }}
    </button>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuth } from '../../composables/useAuth';

const { user, signOut } = useAuth();

const nom = computed(() => user.value?.user_metadata?.nom ?? '');
const prenom = computed(() => user.value?.user_metadata?.prenom ?? '');
const tel = computed(() => user.value?.user_metadata?.tel ?? null);

const displayName = computed(() => {
  const full = [prenom.value, nom.value].filter(Boolean).join(' ');
  return full || user.value?.email || '';
});

const initials = computed(() => {
  const p = prenom.value[0] ?? '';
  const n = nom.value[0] ?? '';
  if (p || n) return (p + n).toUpperCase();
  const email = user.value?.email ?? '';
  return email[0]?.toUpperCase() || '?';
});

const loggingOut = ref(false);
const logoutError = ref(null);

async function handleSignOut() {
  loggingOut.value = true;
  logoutError.value = null;
  try {
    await signOut();
  } catch (err) {
    logoutError.value = 'Impossible de se déconnecter. Réessayez.';
    console.error(err);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 56px);
  padding: 24px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile-header {
  text-align: center;
}

.profile-header h1 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #0f2722;
}

.profile-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(15, 39, 34, 0.08);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #3a8d7a;
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  margin: 0;
  font-size: 20px;
  color: #0f2722;
}

.info-section {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 39, 34, 0.08);
  overflow: hidden;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #0f2722;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.logout-btn {
  width: 100%;
  max-width: 400px;
  padding: 13px;
  border: none;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.logout-btn:hover {
  background: #fee2e2;
}
</style>
