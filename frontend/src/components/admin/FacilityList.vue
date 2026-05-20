<template>
  <div class="admin-facility-list">
    <div class="admin-list-header">
      <h1>Gestion des établissements</h1>

      <input
        v-model="search"
        type="search"
        placeholder="Rechercher un établissement…"
        class="search-bar"
      />
    </div>

    <form class="facility-form" @submit.prevent="submitFacility">
      <input
        v-model.trim="newFacility.nom"
        type="text"
        placeholder="Nom de l'établissement *"
        required
        :disabled="creatingFacility"
        aria-label="Nom de l'établissement"
      />
      <input
        v-model.trim="newFacility.adresse"
        type="text"
        placeholder="Adresse"
        :disabled="creatingFacility"
        aria-label="Adresse de l'établissement"
      />
      <button type="submit" class="facility-btn" :disabled="creatingFacility || !newFacility.nom">
        {{ creatingFacility ? 'Création…' : 'Créer' }}
      </button>
    </form>

    <div class="admin-list-container">
      <p v-if="facilityError" class="admin-error" role="alert">{{ facilityError }}</p>

      <CustomTable
        :columns="[
          { key: 'nom', label: 'Nom' },
          { key: 'adresse', label: 'Adresse' },
          { key: 'created_at', label: 'Créé le' },
        ]"
        :rows="paginatedFacilities"
        :emptyMessage="'Aucun établissement trouvé.'"
      >
        <template #adresse="{ row }">{{ row.adresse ?? '—' }}</template>
        <template #created_at="{ row }">
          {{ new Date(row.created_at).toLocaleDateString('fr-FR') }}
        </template>
      </CustomTable>

      <PaginationControls
        v-model:currentPage="currentPage"
        :total-pages="totalPages"
        :total-items="filtered.length"
        :page-size="PAGE_SIZE"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { api } from '@/lib/api.js';
import CustomTable from '@/components/shared/CustomTable.vue';
import PaginationControls from '@/components/shared/PaginationControls.vue';
import './AdminList.css';

const PAGE_SIZE = 10;

const props = defineProps({
  facilities: { type: Array, default: () => [] },
});

const emit = defineEmits(['refresh']);

const search = ref('');
const newFacility = ref({ nom: '', adresse: '' });
const creatingFacility = ref(false);
const facilityError = ref(null);

const currentPage = ref(1);

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return props.facilities.filter((e) => `${e.nom} ${e.adresse ?? ''}`.toLowerCase().includes(q));
});

const totalPages = computed(() => Math.ceil(filtered.value.length / PAGE_SIZE));

const paginatedFacilities = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filtered.value.slice(start, start + PAGE_SIZE);
});

watch(search, () => {
  currentPage.value = 1;
});

const submitFacility = async () => {
  facilityError.value = null;
  creatingFacility.value = true;
  try {
    await api.post('/api/admin/etablissements', {
      nom: newFacility.value.nom,
      adresse: newFacility.value.adresse || null,
    });
    newFacility.value = { nom: '', adresse: '' };
    emit('refresh');
  } catch (err) {
    facilityError.value = err.message;
  } finally {
    creatingFacility.value = false;
  }
};
</script>
