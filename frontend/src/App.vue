<script>
import { createMemoryHistory, createRouter } from "vue-router";
import NavBar from "./components/layout/navbar/NavBar.vue";

import HomeView from "./views/HomeView.vue";
import StepsView from "./views/StepsView.vue";
import AppointmentsView from "./views/AppointmentsView.vue";
import DocumentsView from "./views/DocumentsView.vue";
import ProfileView from "./views/ProfileView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/steps", component: StepsView },
  { path: "/appointments", component: AppointmentsView },
  { path: "/documents", component: DocumentsView },
  { path: "/profile", component: ProfileView },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default {
  components: {
    NavBar,
  },
};
</script>

<template>
  <NavBar />
  <main class="main-content">
    <RouterView />
  </main>
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

.main-content {
  flex: 1;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 70px;
  }
}

@media (min-width: 769px) {
  .main-content {
    padding-top: 70px;
  }
}
</style>
