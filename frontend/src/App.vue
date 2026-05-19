<script>
import NavBar from './components/shared/NavBar.vue';
import AuthComponent from './components/auth/auth-component.vue';
import { useAuth } from './composables/useAuth';

export default {
  components: { NavBar, AuthComponent },
  setup() {
    const { user, loading } = useAuth();
    return { user, loading };
  },
};
</script>

<template>
  <div v-if="loading" class="loading-container">
    <div class="loader"></div>
  </div>
  <AuthComponent v-else-if="!user" />
  <div v-else id="app-content">
    <NavBar />
    <main class="main-content">
      <RouterView />
    </main>
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
  background: #f0faf8;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3a8d7a;
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
