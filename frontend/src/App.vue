<script setup>
  import { ref } from 'vue';
  import TabBar from './layout/tabbar/tabbar-component.vue';
  import Home from './components/home/home-component.vue';
  import Etapes from './components/etapes/etapes-component.vue';
  import rdvComponent from './components/rendezVous/rdv-component.vue';
  import docComponent from './components/doc/doc-component.vue';
  import AuthComponent from './components/auth/auth-component.vue';
  import NotFound from './components/not-found/not-found-component.vue';
  import { useAuth } from './composables/useAuth';

  const { user, loading, signOut } = useAuth();
  const activeTab = ref('home');

  const navigationTabs = [
    { id: 'home', label: 'Accueil', icon: 'home' },
    { id: 'steps', label: 'Étapes', icon: 'steps' },
    { id: 'appointments', label: 'Rendez-vous', icon: 'calendar' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
  ];

  const handleTabChange = (newTab) => {
    activeTab.value = newTab;
  };
</script>

<template>
  <!-- Loading state while resolving session -->
  <div v-if="loading" class="auth-loading" role="status" aria-label="Chargement">
    <div class="spinner" aria-hidden="true"></div>
  </div>

  <!-- Auth screen when not logged in -->
  <AuthComponent v-else-if="!user" />

  <!-- Main app when logged in -->
  <div v-else id="app" role="application" aria-label="Application Meditrack">
    <!-- Logout button -->
    <button class="logout-btn" aria-label="Se déconnecter" @click="signOut">
      Déconnexion
    </button>

    <!-- Home Tab -->
    <section v-if="activeTab === 'home'" aria-label="Page d'accueil">
      <Home />
    </section>

    <!-- Steps Tab -->
    <section v-else-if="activeTab === 'steps'" aria-label="Page des étapes">
      <Etapes />
    </section>

    <!-- Appointments Tab -->
    <section v-else-if="activeTab === 'appointments'" class="tab-content" aria-label="Page des rendez-vous">
      <rdvComponent />
    </section>

    <!-- Documents Tab -->
    <section v-else-if="activeTab === 'documents'" class="tab-content" aria-label="Page des documents">
      <docComponent />
    </section>

    <!-- 404 fallback -->
    <section v-else aria-label="Page introuvable">
      <NotFound @go-home="handleTabChange('home')" />
    </section>

    <!-- TabBar Navigation -->
    <TabBar :tabs="navigationTabs" default-tab="home" @tab-change="handleTabChange" />
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&display=swap');

#app {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 56px;
  font-family: 'Arimo', sans-serif;
}

.tab-content {
  padding: 16px;
}

@media (min-width: 768px) {
  #app {
    padding-bottom: 64px;
  }
}

.backup-link {
  display: hidden;
  margin-bottom: 12px;
  color: transparent;
  text-decoration: underline;
  cursor: pointer;
}

.backup-link:hover,
.backup-link:focus,
.backup-link:focus-visible {
  opacity: 1;
  color: #2563eb;
  display: inline-block;
}

.backup-link:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 3px;
}

.auth-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0faf8;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #d1faf5;
  border-top-color: #3a8d7a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.logout-btn {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 50;
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.logout-btn:hover {
  background: #f9fafb;
  color: #b91c1c;
  border-color: #fca5a5;
}
</style>
