<template>
  <main class="admin" role="main" aria-label="Administration">
    <header class="admin-header">
      <h1>Gestion des utilisateurs</h1>
    </header>

    <div class="admin-container">
      <div v-if="loading" class="admin-loading" role="status">
        <div class="spinner" aria-hidden="true"></div>
      </div>

      <p v-else-if="error" class="admin-error" role="alert">{{ error }}</p>

      <table v-else class="users-table" aria-label="Liste des utilisateurs">
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Prénom</th>
            <th scope="col">Email</th>
            <th scope="col">Rôle</th>
            <th scope="col">Établissement</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.nom }}</td>
            <td>{{ u.prenom }}</td>
            <td>{{ u.email ?? '—' }}</td>
            <td>
              <select
                :value="u.role"
                :aria-label="`Rôle de ${u.prenom} ${u.nom}`"
                :disabled="u.id === currentUserId || saving === u.id"
                @change="onRoleChange(u, $event.target.value)"
              >
                <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
              </select>
              <span v-if="saving === u.id" class="saving-indicator" aria-live="polite"
                >Sauvegarde…</span
              >
            </td>
            <td>
              <template v-if="u.role === 'DOCTOR' || u.role === 'ASSISTANT'">
                <select
                  :value="u.etablissement_id ?? ''"
                  :aria-label="`Établissement de ${u.prenom} ${u.nom}`"
                  :disabled="savingEtab === u.id"
                  @change="onEtablissementChange(u, $event.target.value)"
                >
                  <option value="">— Aucun —</option>
                  <option v-for="e in etablissements" :key="e.id" :value="e.id">{{ e.nom }}</option>
                </select>
                <span v-if="savingEtab === u.id" class="saving-indicator" aria-live="polite"
                  >Sauvegarde…</span
                >
              </template>
              <span v-else>—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Établissements section -->
    <div class="admin-container" style="margin-top: 32px">
      <h2 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 16px">
        Gestion des établissements
      </h2>

      <form class="etab-form" @submit.prevent="submitEtablissement">
        <input
          v-model.trim="newEtab.nom"
          type="text"
          placeholder="Nom de l'établissement *"
          required
          :disabled="creatingEtab"
          aria-label="Nom de l'établissement"
        />
        <input
          v-model.trim="newEtab.adresse"
          type="text"
          placeholder="Adresse"
          :disabled="creatingEtab"
          aria-label="Adresse de l'établissement"
        />
        <button type="submit" class="etab-btn" :disabled="creatingEtab || !newEtab.nom">
          {{ creatingEtab ? 'Création…' : 'Créer' }}
        </button>
      </form>
      <p v-if="etabError" class="admin-error" role="alert" style="margin-top: 8px">
        {{ etabError }}
      </p>

      <table
        v-if="etablissements.length"
        class="users-table"
        style="margin-top: 16px"
        aria-label="Liste des établissements"
      >
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Adresse</th>
            <th scope="col">Créé le</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in etablissements" :key="e.id">
            <td>{{ e.nom }}</td>
            <td>{{ e.adresse ?? '—' }}</td>
            <td>{{ new Date(e.created_at).toLocaleDateString('fr-FR') }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!loading" style="color: #6b7280; font-size: 0.875rem; margin-top: 12px">
        Aucun établissement créé.
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import { useAuth } from '../../composables/useAuth';
import './admin.css';

const ROLES = ['PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN', 'AIDE'];

const { user } = useAuth();
const currentUserId = user.value?.id;

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(null);
const savingEtab = ref(null);

const etablissements = ref([]);
const newEtab = ref({ nom: '', adresse: '' });
const creatingEtab = ref(false);
const etabError = ref(null);

const loadAll = async () => {
  try {
    [users.value, etablissements.value] = await Promise.all([
      api.get('/api/admin/users'),
      api.get('/api/admin/etablissements'),
    ]);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const onRoleChange = async (u, newRole) => {
  if (!confirm(`Changer le rôle de ${u.prenom} ${u.nom} en ${newRole} ?`)) return;
  saving.value = u.id;
  try {
    const updated = await api.put(`/api/admin/users/${u.id}/role`, { role: newRole });
    u.role = updated.role;
    if (!['DOCTOR', 'ASSISTANT'].includes(u.role)) {
      u.etablissement_id = null;
    }
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    saving.value = null;
  }
};

const onEtablissementChange = async (u, newEtabId) => {
  savingEtab.value = u.id;
  try {
    await api.put(`/api/admin/users/${u.id}/etablissement`, {
      etablissement_id: newEtabId || null,
    });
    u.etablissement_id = newEtabId || null;
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    savingEtab.value = null;
  }
};

const submitEtablissement = async () => {
  etabError.value = null;
  creatingEtab.value = true;
  try {
    const created = await api.post('/api/admin/etablissements', {
      nom: newEtab.value.nom,
      adresse: newEtab.value.adresse || null,
    });
    etablissements.value.push(created);
    etablissements.value.sort((a, b) => a.nom.localeCompare(b.nom));
    newEtab.value = { nom: '', adresse: '' };
  } catch (err) {
    etabError.value = err.message;
  } finally {
    creatingEtab.value = false;
  }
};

onMounted(loadAll);
</script>
