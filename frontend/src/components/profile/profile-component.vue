<template>
  <main class="profile-page" role="main" aria-label="Page profil">
    <header class="profile-header">
      <h1>Chirurgie Suivi</h1>
      <p>Mon profil</p>
    </header>

    <div class="profile-card">
      <div class="avatar" aria-hidden="true">{{ initials }}</div>
      <h2 class="profile-name" tabindex="0">{{ displayName }}</h2>
    </div>

    <section class="info-section" aria-label="Informations personnelles">
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">{{ user.email }}</span>
      </div>
      <div class="info-row" v-if="tel">
        <span class="info-label">Téléphone</span>
        <span class="info-value">{{ tel }}</span>
      </div>
    </section>

    <!-- Mes médecins (PATIENT uniquement) -->
    <section
      v-if="userRole === 'PATIENT'"
      class="info-section doctors-section"
      aria-label="Mes médecins"
    >
      <h3 class="section-title">Mes médecins</h3>
      <div v-if="loadingDoctors" class="doctors-loading" role="status">
        <div class="mini-spinner" aria-hidden="true"></div>
      </div>
      <p v-else-if="myDoctors.length === 0" class="doctors-empty">Aucun médecin assigné.</p>
      <div v-else v-for="d in myDoctors" :key="d.id" class="doctor-card">
        <p class="doctor-fullname">Dr. {{ d.prenom }} {{ d.nom }}</p>
        <div v-if="d.specialite" class="info-row">
          <span class="info-label">Spécialité</span>
          <span class="info-value">{{ d.specialite }}</span>
        </div>
        <div v-if="d.tel" class="info-row">
          <span class="info-label">Téléphone</span>
          <span class="info-value">{{ d.tel }}</span>
        </div>
        <div v-if="d.num_service" class="info-row">
          <span class="info-label">N° de service</span>
          <span class="info-value">{{ d.num_service }}</span>
        </div>
        <div v-if="d.horaire_service" class="info-row">
          <span class="info-label">Horaires</span>
          <span class="info-value">{{ d.horaire_service }}</span>
        </div>
        <div v-if="d.email" class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ d.email }}</span>
        </div>
      </div>
    </section>

    <!-- Mes aides (PATIENT uniquement) -->
    <section v-if="userRole === 'PATIENT'" class="info-section" aria-label="Mes aides">
      <h3 class="section-title">Mes aides</h3>
      <div v-if="loadingAides" class="doctors-loading" role="status">
        <div class="mini-spinner" aria-hidden="true"></div>
      </div>
      <p v-else-if="myAides.length === 0" class="doctors-empty">Aucun aide assigné.</p>
      <div v-else v-for="a in myAides" :key="a.aide_id" class="doctor-card">
        <p class="doctor-fullname">{{ a.profiles?.prenom }} {{ a.profiles?.nom }}</p>
      </div>
    </section>

    <!-- Informations professionnelles (DOCTOR uniquement) -->
    <section
      v-if="userRole === 'DOCTOR'"
      class="info-section"
      aria-label="Informations professionnelles"
    >
      <h3 class="section-title">Informations professionnelles</h3>
      <div class="doctor-edit-form">
        <div class="field-group">
          <label class="field-label" for="specialite">Spécialité</label>
          <input
            id="specialite"
            v-model="doctorProfile.specialite"
            class="field-input"
            type="text"
            placeholder="Ex: Chirurgie orthopédique"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="num_service">N° du service (tél)</label>
          <input
            id="num_service"
            v-model="doctorProfile.num_service"
            class="field-input"
            type="text"
            placeholder="+0300000000"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="horaire_service">Horaires du service</label>
          <input
            id="horaire_service"
            v-model="doctorProfile.horaire_service"
            class="field-input"
            type="text"
            placeholder="Ex: Lun-Ven 8h-18h"
          />
        </div>
        <p v-if="saveError" class="save-error" role="alert">{{ saveError }}</p>
        <p v-if="saveSuccess" class="save-success" role="status">Informations enregistrées.</p>
        <button class="save-btn" :disabled="saving" @click="saveDoctorProfile">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
      </div>
    </section>

    <!-- Accès documents (PATIENT uniquement) -->
    <router-link
      v-if="userRole === 'PATIENT'"
      to="/documents"
      class="documents-btn"
      aria-label="Accéder à mes documents"
    >
      <i class="fa-solid fa-file" aria-hidden="true"></i>
      Mes documents
    </router-link>

    <p v-if="logoutError" class="logout-error" role="alert">{{ logoutError }}</p>

    <button
      class="logout-btn"
      aria-label="Se déconnecter"
      :disabled="loggingOut"
      @click="handleSignOut"
    >
      {{ loggingOut ? 'Déconnexion…' : 'Se déconnecter' }}
    </button>
  </main>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { api } from '../../lib/api';

const { user, userRole, signOut } = useAuth();

const nom = computed(() => user.value?.user_metadata?.nom ?? '');
const prenom = computed(() => user.value?.user_metadata?.prenom ?? '');
const tel = computed(() => user.value?.user_metadata?.tel ?? null);

const displayName = computed(() => {
  const full = [prenom.value, nom.value].filter(Boolean).join(' ');
  return full || user.value?.email || '';
});

const initials = computed(() => {
  const p = prenom.value[0] ?? '';
  const n = nom.value[0] ?? '';
  if (p || n) return (p + n).toUpperCase();
  const email = user.value?.email ?? '';
  return email[0]?.toUpperCase() || '?';
});

const loggingOut = ref(false);
const logoutError = ref(null);
const myDoctors = ref([]);
const loadingDoctors = ref(false);
const myAides = ref([]);
const loadingAides = ref(false);

const doctorProfile = ref({ specialite: '', num_service: '', horaire_service: '' });
const saving = ref(false);
const saveError = ref(null);
const saveSuccess = ref(false);

async function handleSignOut() {
  loggingOut.value = true;
  logoutError.value = null;
  try {
    await signOut();
  } catch (err) {
    logoutError.value = 'Impossible de se déconnecter. Réessayez.';
    console.error(err);
  } finally {
    loggingOut.value = false;
  }
}

async function saveDoctorProfile() {
  saving.value = true;
  saveError.value = null;
  saveSuccess.value = false;
  try {
    const updated = await api.put('/api/doctor/profile', {
      specialite: doctorProfile.value.specialite || null,
      num_service: doctorProfile.value.num_service || null,
      horaire_service: doctorProfile.value.horaire_service || null,
    });
    doctorProfile.value = {
      specialite: updated.specialite ?? '',
      num_service: updated.num_service ?? '',
      horaire_service: updated.horaire_service ?? '',
    };
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
    }, 3000);
  } catch (err) {
    saveError.value = 'Erreur lors de la sauvegarde.';
    console.error(err);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (userRole.value === 'PATIENT') {
    loadingDoctors.value = true;
    loadingAides.value = true;
    try {
      [myDoctors.value, myAides.value] = await Promise.all([
        api.get('/api/profile/my-doctors').catch(() => []),
        api.get('/api/profile/my-aides').catch(() => []),
      ]);
    } finally {
      loadingDoctors.value = false;
      loadingAides.value = false;
    }
  }
  if (userRole.value === 'DOCTOR') {
    try {
      const p = await api.get('/api/doctor/profile');
      doctorProfile.value = {
        specialite: p.specialite ?? '',
        num_service: p.num_service ?? '',
        horaire_service: p.horaire_service ?? '',
      };
    } catch {
      /* non-bloquant */
    }
  }
});
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 56px);
  padding: 24px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.profile-header {
  text-align: center;
}

.profile-header h1 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #0f2722;
}

.profile-header p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(15, 39, 34, 0.08);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #3a8d7a;
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-name {
  margin: 0;
  font-size: 20px;
  color: #0f2722;
}

.info-section {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 39, 34, 0.08);
  overflow: hidden;
}

.section-title {
  padding: 14px 18px 0;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #3a8d7a;
}

.doctors-section .info-row:first-of-type {
  border-top: 1px solid #f3f4f6;
  margin-top: 10px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #0f2722;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.doctors-loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #d1faf5;
  border-top-color: #3a8d7a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.doctors-empty {
  padding: 14px 18px;
  font-size: 14px;
  color: #aaa;
  margin: 0;
}

.doctor-card {
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 4px;
}

.doctor-card:last-child {
  border-bottom: none;
}

.doctor-fullname {
  margin: 12px 18px 4px;
  font-size: 14px;
  font-weight: 700;
  color: #3a8d7a;
}

.doctor-edit-form {
  padding: 14px 18px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field-input {
  padding: 10px 14px;
  border: 1.5px solid #d1faf5;
  border-radius: 10px;
  font-size: 14px;
  color: #0f2722;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #3a8d7a;
}

.save-btn {
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: #3a8d7a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover:not(:disabled) {
  background: #2f7364;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-error {
  font-size: 13px;
  color: #b91c1c;
  margin: 0;
}

.save-success {
  font-size: 13px;
  color: #3a8d7a;
  margin: 0;
}

.documents-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  padding: 13px;
  border-radius: 12px;
  background: #f0fdf9;
  color: #3a8d7a;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
  border: 1.5px solid #d1faf5;
}

.documents-btn:hover {
  background: #d1faf5;
}

.logout-btn {
  width: 100%;
  max-width: 400px;
  padding: 13px;
  border: none;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.logout-btn:hover {
  background: #fee2e2;
}
</style>
