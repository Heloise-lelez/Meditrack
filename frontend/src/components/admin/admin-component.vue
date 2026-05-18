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
              <span v-if="saving === u.id" class="saving-indicator" aria-live="polite">Sauvegarde…</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import { useAuth } from '../../composables/useAuth';
import './admin.css';

const ROLES = ['PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN'];

const { user } = useAuth();
const currentUserId = user.value?.id;

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const saving = ref(null);

const loadUsers = async () => {
  try {
    users.value = await api.get('/api/admin/users');
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
  } catch (err) {
    alert(`Erreur : ${err.message}`);
  } finally {
    saving.value = null;
  }
};

onMounted(loadUsers);
</script>
