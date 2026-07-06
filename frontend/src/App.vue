<script>
import { watch, onUnmounted } from 'vue';
import NavBar from './components/shared/NavBar.vue';
import AuthComponent from './components/auth/auth-component.vue';
import NotificationToast from './components/shared/NotificationToast.vue';
import { useAuth } from './composables/useAuth';
import { usePatientNotifications } from './composables/usePatientNotifications';
import { api } from './lib/api';
import LandingPage from '@/views/LandingPage.vue';

export default {
  components: { LandingPage, NavBar, AuthComponent, NotificationToast },
  setup() {
    const { user, loading, userRole } = useAuth();
    const { notifications, init, cleanup, dismiss } = usePatientNotifications();

    watch(loading, async (isLoading) => {
      if (!isLoading && userRole.value === 'AIDE') {
        try {
          const patients = await api.get('/api/aide/patients');
          init(patients);
        } catch {
          /* non-blocking */
        }
      }
    });

    onUnmounted(cleanup);

    return { user, loading, notifications, dismiss };
  },
};
</script>

<template>
  <div v-if="loading" class="loading-container">
    <div class="loader"></div>
  </div>
  <LandingPage v-else-if="!user" />
  <div v-else id="app-content">
    <NavBar />
    <main class="main-content">
      <RouterView />
    </main>
    <NotificationToast :notifications="notifications" @dismiss="dismiss" />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-primary-background);
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 70px;
  }
}
</style>
