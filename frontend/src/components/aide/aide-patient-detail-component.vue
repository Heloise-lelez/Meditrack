<template>
  <div class="detail" :aria-label="`Dossier de ${patient.prenom} ${patient.nom}`">
    <header class="detail-header">
      <button class="back-btn" @click="$emit('back')" aria-label="Retour à la liste">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Retour
      </button>
      <h1>{{ patient.prenom }} {{ patient.nom }}</h1>
    </header>

    <nav class="sub-tabs" role="tablist" aria-label="Sections du dossier">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="sub-tab"
        :class="{ active: activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- ── Tâches du jour ──────────────────────────────────────── -->
    <section v-if="activeTab === 'taches'" class="section" aria-label="Tâches du patient">
      <div class="section-actions">
        <input
          type="date"
          v-model="tacheDate"
          class="date-input"
          aria-label="Filtrer par date"
          @change="loadTaches"
        />
        <button
          v-if="tacheDate"
          class="btn-secondary"
          type="button"
          @click="
            tacheDate = '';
            loadTaches();
          "
        >
          Toutes les dates
        </button>
      </div>

      <ul class="item-list" role="list">
        <li v-if="tacheList.length === 0" class="item-empty">
          Aucune tâche{{ tacheDate ? ' pour cette date' : '' }}.
        </li>
        <li v-for="t in tacheList" :key="t.id_tache" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ TASK_LABELS[t.nom_tache] ?? t.nom_tache }}</div>
            <div class="item-meta">
              {{ t.date_tache }}{{ t.heure ? ' · ' + t.heure.slice(0, 5) : '' }} ·
              <span :class="`statut-${t.statut}`">{{ STATUT_LABELS[t.statut] }}</span>
            </div>
            <div v-if="t.commentaire" class="item-comment">{{ t.commentaire }}</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Étapes ─────────────────────────────────────────────── -->
    <section v-if="activeTab === 'etapes'" class="section" aria-label="Étapes du patient">
      <ul class="item-list" role="list">
        <li v-if="etapeList.length === 0" class="item-empty">Aucune étape.</li>
        <li v-for="e in etapeList" :key="e.id_etape" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ e.titre }}</div>
            <div class="item-meta">
              {{ e.date_debut }}{{ e.date_fin ? ' → ' + e.date_fin : '' }}
              <span v-if="e.checklist?.length" class="checklist-count">
                · {{ e.checklist.filter((c) => c.fait).length }}/{{ e.checklist.length }} éléments
              </span>
            </div>
            <div v-if="e.detail" class="item-comment">{{ e.detail }}</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Rendez-vous ──────────────────────────────────────────── -->
    <section v-if="activeTab === 'rdv'" class="section" aria-label="Rendez-vous du patient">
      <ul class="item-list" role="list">
        <li v-if="rdvList.length === 0" class="item-empty">Aucun rendez-vous.</li>
        <li v-for="r in rdvList" :key="r.id" class="item-row">
          <div class="item-info">
            <div class="item-title">Dr. {{ r.doctor_first_name }} {{ r.doctor_last_name }}</div>
            <div class="item-meta">{{ r.profession }} · {{ formatDateTime(r.starts_at) }}</div>
            <div v-if="r.address" class="item-comment">{{ r.address }}</div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';

const props = defineProps({ patient: { type: Object, required: true } });
defineEmits(['back']);

const pid = props.patient.id;
const activeTab = ref('taches');

const TABS = [
  { id: 'taches', label: 'Tâches du jour' },
  { id: 'etapes', label: 'Étapes' },
  { id: 'rdv', label: 'Rendez-vous' },
];

const TASK_LABELS = {
  prise_medicaments: 'Prise de médicaments',
  chimio: 'Chimiothérapie',
  irm: 'IRM',
  scanner: 'Scanner',
  prise_de_sang: 'Prise de sang',
  consultation: 'Consultation',
  radiotherapie: 'Radiothérapie',
  soins_infirmiers: 'Soins infirmiers',
};

const STATUT_LABELS = { a_faire: 'À faire', fait: 'Fait', ratee: 'Ratée' };

const tacheDate = ref('');
const tacheList = ref([]);
const etapeList = ref([]);
const rdvList = ref([]);

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

const loadTaches = async () => {
  const qs = tacheDate.value ? `?date=${tacheDate.value}` : '';
  try {
    tacheList.value = await api.get(`/api/aide/patients/${pid}/taches${qs}`);
  } catch {
    tacheList.value = [];
  }
};

onMounted(async () => {
  await Promise.all([
    loadTaches(),
    api
      .get(`/api/aide/patients/${pid}/etapes`)
      .then((d) => (etapeList.value = d || []))
      .catch(() => {}),
    api
      .get(`/api/aide/patients/${pid}/rendezvous`)
      .then((d) => (rdvList.value = d || []))
      .catch(() => {}),
  ]);
});
</script>
