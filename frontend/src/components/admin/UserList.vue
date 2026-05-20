<template>
  <div class="admin-user-list">
    <div class="admin-list-header">
      <h1>Gestion des utilisateurs</h1>

      <div class="filters">
        <button
          v-if="search || filterRole || filterFacilities"
          class="btn-reset"
          @click="resetFilters"
        >
          Réinitialiser
        </button>

        <select v-model="filterRole" class="filter-select">
          <option value="">Tous les rôles</option>
          <option v-for="role in rolesOptions" :key="role" :value="role">{{ role }}</option>
        </select>

        <select v-model="filterFacilities" class="filter-select">
          <option value="">Tous les établissements</option>
          <option v-for="facility in props.facilities" :key="facility.id" :value="facility.id">
            {{ facility.nom }}
          </option>
        </select>

        <input v-model="search" type="search" placeholder="Rechercher…" class="search-bar" />
      </div>
    </div>

    <div class="admin-list-container">
      <div v-if="loading" class="admin-loading" role="status">
        <div class="spinner" aria-hidden="true"></div>
      </div>

      <p v-else-if="error" class="admin-error" role="alert">{{ error }}</p>

      <CustomTable
        :columns="[
          { key: 'nom', label: 'Nom' },
          { key: 'prenom', label: 'Prénom' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Rôle' },
          { key: 'etablissement', label: 'Établissement' },
        ]"
        :rows="filteredUsers"
        :loading="loading"
        :emptyMessage="'Aucun utilisateur trouvé.'"
      >
        <template #email="{ row }">{{ row.email ?? '—' }}</template>

        <template #role="{ row }">
          <div class="cell-select">
            <select
              :value="row.role"
              :disabled="row.id === currentUserId || saving === row.id"
              :aria-label="`Rôle de ${row.prenom} ${row.nom}`"
              class="table-select"
              @change="onRoleChange(row, $event.target.value)"
            >
              <option v-for="r in rolesOptions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
        </template>

        <template #etablissement="{ row }">
          <div class="cell-select">
            <template v-if="row.role === ROLES.DOCTOR || row.role === ROLES.ASSISTANT">
              <select
                :value="row.etablissement_id ?? ''"
                :disabled="savingFacilities === row.id"
                :aria-label="`Établissement de ${row.prenom} ${row.nom}`"
                class="table-select"
                @change="onFacilityChange(row, $event.target.value)"
              >
                <option value="">— Aucun —</option>
                <option v-for="e in props.facilities" :key="e.id" :value="e.id">
                  {{ e.nom }}
                </option>
              </select>
            </template>
            <span v-else>—</span>
          </div>
        </template>
      </CustomTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/lib/api.js';
import { ROLES } from '@/constants/roles.js';
import CustomTable from '@/components/shared/CustomTable.vue';

const rolesOptions = Object.values(ROLES);

const props = defineProps({
  users: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  facilities: { type: Array, default: () => [] },
});

const { user } = useAuth();
const currentUserId = user.value?.id;
const saving = ref(null);
const savingFacilities = ref(null);
const search = ref('');

const filterRole = ref('');
const filterFacilities = ref('');

const onRoleChange = async (u, newRole) => {
  if (!confirm(`Changer le rôle de ${u.prenom} ${u.nom} en ${newRole} ?`)) return;
  saving.value = u.id;
  try {
    const updated = await api.put(`/api/admin/users/${u.id}/role`, { role: newRole });
    u.role = updated.role;
    if (!['DOCTOR', 'ASSISTANT'].includes(u.role)) u.etablissement_id = null;
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    saving.value = null;
  }
};

const onFacilityChange = async (u, newFacilityId) => {
  savingFacilities.value = u.id;
  try {
    await api.put(`/api/admin/users/${u.id}/etablissement`, {
      etablissement_id: newFacilityId || null,
    });
    u.etablissement_id = newFacilityId || null;
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    savingFacilities.value = null;
  }
};

const filteredUsers = computed(() =>
  props.users.filter((u) => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`
      .toLowerCase()
      .includes(search.value.toLowerCase());
    const matchRole = filterRole.value ? u.role === filterRole.value : true;
    const matchFacility = filterFacilities.value
      ? u.etablissement_id === filterFacilities.value
      : true;
    return matchSearch && matchRole && matchFacility;
  })
);

const resetFilters = () => {
  search.value = '';
  filterRole.value = '';
  filterFacilities.value = '';
};
</script>
