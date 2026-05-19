import { createRouter, createWebHistory } from 'vue-router';
import { watch } from 'vue';
import HomeView from '@/views/HomeView.vue';
import { useAuth } from '@/composables/useAuth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/steps',
    name: 'steps',
    component: () => import('@/views/StepsView.vue'),
    meta: { requiresRole: 'PATIENT' },
  },
  {
    path: '/appointments',
    name: 'appointments',
    component: () => import('@/views/AppointmentsView.vue'),
    meta: { requiresRole: 'PATIENT' },
  },
  {
    path: '/documents',
    name: 'documents',
    component: () => import('@/views/DocumentsView.vue'),
    meta: { requiresRole: 'PATIENT' },
  },
  {
    path: '/patients',
    name: 'patients',
    component: () => import('@/views/PatientsListView.vue'),
    meta: { requiresRole: 'DOCTOR' },
  },
  {
    path: '/assistant',
    name: 'assistant',
    component: () => import('@/views/AssistantView.vue'),
    meta: { requiresRole: 'ASSISTANT' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresRole: 'SUPER_ADMIN' },
  },
  {
    path: '/search-patients',
    name: 'search-patients',
    component: () => import('@/views/SearchPatientsView.vue'),
    meta: { requiresRole: 'DOCTOR' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { userRole, loading } = useAuth();

  if (loading.value) {
    await new Promise((resolve) => {
      const unwatch = watch(loading, (val) => {
        if (!val) {
          unwatch();
          resolve();
        }
      });
    });
  }

  if (to.meta.requiresRole && userRole.value !== to.meta.requiresRole) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
