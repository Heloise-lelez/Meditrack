<template>
  <main class="assistant" role="main" aria-label="Gestion des assignations">
    <header class="assistant-header">
      <h1>Assignations patients</h1>
    </header>

    <div v-if="loading" class="assistant-loading" role="status">
      <div class="spinner" aria-hidden="true"></div>
    </div>

    <div v-else>
      <!-- Main tabs: Médecins / Aides -->
      <nav class="main-tabs" role="tablist" aria-label="Section">
        <button
          class="main-tab"
          :class="{ active: mainTab === 'medecins' }"
          role="tab"
          :aria-selected="mainTab === 'medecins'"
          @click="mainTab = 'medecins'"
        >
          Médecins
        </button>
        <button
          class="main-tab"
          :class="{ active: mainTab === 'aides' }"
          role="tab"
          :aria-selected="mainTab === 'aides'"
          @click="mainTab = 'aides'"
        >
          Aides
        </button>
      </nav>

      <!-- ── Panneau Médecins ──────────────────────────────────── -->
      <div v-if="mainTab === 'medecins'" class="assistant-body">
        <section class="col" aria-label="Liste des patients">
          <h2>Patients</h2>
          <ul class="person-list" role="list">
            <li v-if="patients.length === 0" class="person-empty">Aucun patient.</li>
            <li
              v-for="p in patients"
              :key="p.id"
              class="person-row"
              :class="{ selected: selectedPatient?.id === p.id }"
              role="button"
              tabindex="0"
              :aria-label="`Sélectionner ${p.prenom} ${p.nom}`"
              @click="selectedPatient = p"
              @keydown.enter.space.prevent="selectedPatient = p"
            >
              <div class="person-avatar" aria-hidden="true">{{ p.prenom[0] }}{{ p.nom[0] }}</div>
              <div class="person-info">
                <div class="person-name">{{ p.prenom }} {{ p.nom }}</div>
                <div class="person-doctors">
                  {{
                    doctorsOf(p.id)
                      .map((d) => `Dr. ${d.prenom} ${d.nom}`)
                      .join(', ') || 'Aucun médecin'
                  }}
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="col" aria-label="Liste des médecins">
          <h2>Médecins</h2>
          <p v-if="!selectedPatient" class="col-hint">← Sélectionner un patient pour assigner</p>
          <ul v-else class="person-list" role="list">
            <li v-if="doctors.length === 0" class="person-empty">Aucun médecin.</li>
            <li v-for="d in doctors" :key="d.id" class="person-row doctor-row">
              <div class="person-avatar doctor-avatar" aria-hidden="true">
                {{ d.prenom[0] }}{{ d.nom[0] }}
              </div>
              <div class="person-info">
                <div class="person-name">Dr. {{ d.prenom }} {{ d.nom }}</div>
              </div>
              <button
                v-if="isAssigned(selectedPatient.id, d.id)"
                class="btn-unassign"
                :aria-label="`Retirer ${d.prenom} ${d.nom} du patient`"
                :disabled="busy"
                @click="unassign(selectedPatient.id, d.id)"
              >
                Retirer
              </button>
              <button
                v-else
                class="btn-assign"
                :aria-label="`Assigner ${d.prenom} ${d.nom} au patient`"
                :disabled="busy"
                @click="assign(selectedPatient.id, d.id)"
              >
                Assigner
              </button>
            </li>
          </ul>
        </section>
      </div>

      <!-- ── Panneau Aides ─────────────────────────────────────── -->
      <div v-if="mainTab === 'aides'" class="assistant-body">
        <section class="col" aria-label="Liste des aides">
          <h2>Aides</h2>

          <div v-if="showAideForm" class="inline-form">
            <h3>Nouveau compte aide</h3>
            <div class="field-row">
              <label for="aide-prenom">Prénom</label>
              <input id="aide-prenom" v-model="aideForm.prenom" autocomplete="off" />
            </div>
            <div class="field-row">
              <label for="aide-nom">Nom</label>
              <input id="aide-nom" v-model="aideForm.nom" autocomplete="off" />
            </div>
            <div class="field-row">
              <label for="aide-email">Email</label>
              <input id="aide-email" v-model="aideForm.email" type="email" autocomplete="off" />
            </div>
            <div class="field-row">
              <label for="aide-password">Mot de passe</label>
              <input id="aide-password" v-model="aideForm.password" type="password" />
            </div>
            <div class="field-row">
              <label for="aide-tel">Téléphone (optionnel)</label>
              <input id="aide-tel" v-model="aideForm.tel" type="tel" />
            </div>
            <p v-if="aideFormError" class="form-error" role="alert">{{ aideFormError }}</p>
            <div class="form-actions">
              <button class="btn-create" :disabled="busyForm" @click="createAide">
                {{ busyForm ? 'Création…' : 'Créer' }}
              </button>
              <button class="btn-cancel" @click="cancelAideForm">Annuler</button>
            </div>
          </div>

          <button v-else class="btn-add-aide" @click="showAideForm = true">
            + Créer un compte aide
          </button>

          <ul class="person-list" role="list">
            <li v-if="aides.length === 0" class="person-empty">Aucun aide.</li>
            <li
              v-for="a in aides"
              :key="a.id"
              class="person-row"
              :class="{ selected: selectedAide?.id === a.id }"
              role="button"
              tabindex="0"
              :aria-label="`Sélectionner ${a.prenom} ${a.nom}`"
              @click="selectedAide = a"
              @keydown.enter.space.prevent="selectedAide = a"
            >
              <div class="person-avatar aide-avatar" aria-hidden="true">
                {{ a.prenom[0] }}{{ a.nom[0] }}
              </div>
              <div class="person-info">
                <div class="person-name">{{ a.prenom }} {{ a.nom }}</div>
                <div class="person-aides">
                  {{
                    patientsOf(a.id)
                      .map((p) => `${p.prenom} ${p.nom}`)
                      .join(', ') || 'Aucun patient'
                  }}
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="col" aria-label="Assignation aide ↔ patient">
          <h2>Patients</h2>
          <p v-if="!selectedAide" class="col-hint">← Sélectionner un aide pour assigner</p>
          <ul v-else class="person-list" role="list">
            <li v-if="patients.length === 0" class="person-empty">Aucun patient.</li>
            <li v-for="p in patients" :key="p.id" class="person-row doctor-row">
              <div class="person-avatar" aria-hidden="true">{{ p.prenom[0] }}{{ p.nom[0] }}</div>
              <div class="person-info">
                <div class="person-name">{{ p.prenom }} {{ p.nom }}</div>
              </div>
              <button
                v-if="isAideAssigned(p.id, selectedAide.id)"
                class="btn-unassign"
                :aria-label="`Retirer l'aide de ${p.prenom} ${p.nom}`"
                :disabled="busy"
                @click="unassignAide(p.id, selectedAide.id)"
              >
                Retirer
              </button>
              <button
                v-else
                class="btn-assign"
                :aria-label="`Assigner l'aide à ${p.prenom} ${p.nom}`"
                :disabled="busy"
                @click="assignAide(p.id, selectedAide.id)"
              >
                Assigner
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import './assistant.css';

const patients = ref([]);
const doctors = ref([]);
const assignments = ref([]);
const aides = ref([]);
const aideAssignments = ref([]);
const loading = ref(true);
const busy = ref(false);
const busyForm = ref(false);
const selectedPatient = ref(null);
const selectedAide = ref(null);
const mainTab = ref('medecins');
const showAideForm = ref(false);
const aideFormError = ref(null);

const aideForm = ref({ prenom: '', nom: '', email: '', password: '', tel: '' });

// ── Médecins helpers ──────────────────────────────────────────────────────────

const isAssigned = (patientId, doctorId) =>
  assignments.value.some((a) => a.patient_id === patientId && a.doctor_id === doctorId);

const doctorsOf = (patientId) =>
  assignments.value
    .filter((a) => a.patient_id === patientId)
    .map((a) => doctors.value.find((d) => d.id === a.doctor_id))
    .filter(Boolean);

const assign = async (patient_id, doctor_id) => {
  busy.value = true;
  try {
    await api.post('/api/assistant/assignments', { patient_id, doctor_id });
    assignments.value.push({ patient_id, doctor_id });
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

const unassign = async (patient_id, doctor_id) => {
  busy.value = true;
  try {
    await api.delete('/api/assistant/assignments', { patient_id, doctor_id });
    assignments.value = assignments.value.filter(
      (a) => !(a.patient_id === patient_id && a.doctor_id === doctor_id)
    );
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

// ── Aides helpers ─────────────────────────────────────────────────────────────

const isAideAssigned = (patientId, aideId) =>
  aideAssignments.value.some((a) => a.patient_id === patientId && a.aide_id === aideId);

const patientsOf = (aideId) =>
  aideAssignments.value
    .filter((a) => a.aide_id === aideId)
    .map((a) => patients.value.find((p) => p.id === a.patient_id))
    .filter(Boolean);

const assignAide = async (patient_id, aide_id) => {
  busy.value = true;
  try {
    await api.post('/api/assistant/aides/assign', { aide_id, patient_id });
    aideAssignments.value.push({ aide_id, patient_id });
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

const unassignAide = async (patient_id, aide_id) => {
  busy.value = true;
  try {
    await api.delete('/api/assistant/aides/assign', { aide_id, patient_id });
    aideAssignments.value = aideAssignments.value.filter(
      (a) => !(a.patient_id === patient_id && a.aide_id === aide_id)
    );
  } catch (e) {
    alert(e.message);
  } finally {
    busy.value = false;
  }
};

const createAide = async () => {
  const { prenom, nom, email, password, tel } = aideForm.value;
  if (!prenom || !nom || !email || !password) {
    aideFormError.value = 'Prénom, nom, email et mot de passe sont requis.';
    return;
  }
  busyForm.value = true;
  aideFormError.value = null;
  try {
    const created = await api.post('/api/assistant/aides', {
      prenom,
      nom,
      email,
      password,
      tel: tel || null,
    });
    aides.value.push({ id: created.id, prenom: created.prenom, nom: created.nom });
    cancelAideForm();
  } catch (e) {
    aideFormError.value = e.message;
  } finally {
    busyForm.value = false;
  }
};

const cancelAideForm = () => {
  showAideForm.value = false;
  aideForm.value = { prenom: '', nom: '', email: '', password: '', tel: '' };
  aideFormError.value = null;
};

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const [p, d, a, ai, aa] = await Promise.all([
      api.get('/api/assistant/patients').catch(() => []),
      api.get('/api/assistant/doctors').catch(() => []),
      api.get('/api/assistant/assignments').catch(() => []),
      api.get('/api/assistant/aides').catch(() => []),
      api.get('/api/assistant/aide-assignments').catch(() => []),
    ]);
    patients.value = p;
    doctors.value = d;
    assignments.value = a;
    aides.value = ai;
    aideAssignments.value = aa;
  } finally {
    loading.value = false;
  }
});
</script>
