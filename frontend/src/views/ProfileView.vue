<template>
  <main class="profile-page" role="main" aria-label="Page profil">
    <div class="profile-layout">
      <ProfileCard :user="user" :user-role="userRole" @sign-out="handleSignOut" />

      <div class="profile-content">
        <ProfileDoctorsCard
          v-if="userRole === ROLES.PATIENT"
          :my-doctors="myDoctors"
          :loading-doctors="loadingDoctors"
        />

        <DoctorCard
          v-if="userRole === ROLES.DOCTOR"
          :doctor-profile="doctorProfile"
          :saving="saving"
          :save-error="saveError"
          :save-success="saveSuccess"
          @save="saveDoctorProfile"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth.js';
import { api } from '@/lib/api.js';
import ProfileCard from '@/components/profile/ProfileCard.vue';
import { ROLES } from '@/constants/roles.js';
import ProfileDoctorsCard from '@/components/profile/DoctorList.vue';
import DoctorCard from '@/components/profile/DoctorCard.vue';

const { user, userRole, signOut } = useAuth();

const loggingOut = ref(false);
const logoutError = ref(null);
const myDoctors = ref([]);
const loadingDoctors = ref(false);

const doctorProfile = ref({ specialite: '', num_service: '', horaire_service: '' });
const saving = ref(false);
const saveError = ref(null);
const saveSuccess = ref(false);

async function handleSignOut() {
  loggingOut.value = true;
  logoutError.value = null;
  try {
    await signOut();
  } catch {
    logoutError.value = 'Impossible de se déconnecter. Réessayez.';
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
  } catch {
    saveError.value = 'Erreur lors de la sauvegarde.';
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  if (userRole.value === ROLES.PATIENT) {
    loadingDoctors.value = true;
    try {
      myDoctors.value = await api.get('/api/profile/my-doctors');
    } finally {
      loadingDoctors.value = false;
    }
  }
  if (userRole.value === ROLES.DOCTOR) {
    try {
      const p = await api.get('/api/doctor/profile');
      doctorProfile.value = {
        specialite: p.specialite ?? '',
        num_service: p.num_service ?? '',
        horaire_service: p.horaire_service ?? '',
      };
    } catch {}
  }
});
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  margin: 0 auto;
  align-items: start;
}

/* Mobile — colonne unique */
@media (max-width: 768px) {
  .profile-page {
    margin-bottom: 70px;
  }

  .profile-layout {
    grid-template-columns: 1fr;
  }
}
</style>
