<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UserList from '@/components/admin/UserList.vue';
import EstablishmentList from '@/components/admin/FacilityList.vue';
import { api } from '@/lib/api';
import FacilityList from '@/components/admin/FacilityList.vue';

const activeTab = ref<'users' | 'facilities'>('users');

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const facilities = ref([]);

const loadAll = async () => {
  try {
    const [rawUsers, rawFacilities] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/etablissements'),
    ]);

    users.value = rawUsers.sort((a, b) => a.nom.localeCompare(b.nom));
    facilities.value = rawFacilities.sort((a, b) => a.nom.localeCompare(b.nom));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(loadAll);
</script>

<template>
  <div class="tabs">
    <button :class="['tab', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
      Utilisateurs
    </button>
    <button
      :class="['tab', { active: activeTab === 'facilities' }]"
      @click="activeTab = 'facilities'"
    >
      Établissements
    </button>
  </div>

  <div class="tab-content">
    <UserList
      v-if="activeTab === 'users'"
      :users="users"
      :loading="loading"
      :error="error"
      :facilities="facilities"
    />

    <FacilityList v-if="activeTab === 'facilities'" :facilities="facilities" @refresh="loadAll" />
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-gray-light);
  margin-bottom: 24px;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray);
  border-bottom: 2px solid transparent;
  transition: all 0.5s ease;
}

.tab:hover {
  color: var(--color-primary-hover);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

@media (max-width: 768px) {
  .tab-content {
    margin-bottom: 70px;
  }
}
</style>
