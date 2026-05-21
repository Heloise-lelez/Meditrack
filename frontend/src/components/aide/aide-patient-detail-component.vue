<template>
  <div class="detail" :aria-label="`Dossier de ${patient.prenom} ${patient.nom}`">
    <div class="detail-header">
      <button class="back-btn" @click="$emit('back')" aria-label="Retour à la liste">
        <div class="back-btn-icon">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </div>
        <span>Retour</span>
      </button>
      <h3 class="patient-name-display">{{ patient.prenom }} {{ patient.nom }}</h3>
    </div>

    <div class="tabs" role="tablist" aria-label="Sections du dossier">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="sub-tab"
        :class="['tab', { active: activeTab === tab.id }]"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Tâches du jour ──────────────────────────────────────── -->
    <section v-if="activeTab === 'taches'" aria-label="Tâches du patient">
      <div class="section-actions">
        <div class="input-group">
          <input
            type="date"
            v-model="tacheDate"
            class="date-input"
            aria-label="Filtrer par date"
            @change="loadTaches"
          />
        </div>
        <button
          v-if="tacheDate"
          class="btn-secondary"
          type="button"
          @click="
            tacheDate = '';
            loadTaches();
          "
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          Voir tout
        </button>
      </div>

      <ul class="item-list" role="list">
        <li v-if="tacheList.length === 0" class="item-empty">
          <div class="empty-icon">
            <i class="fa-regular fa-calendar-check" aria-hidden="true"></i>
          </div>
          <p>Aucune tâche{{ tacheDate ? ' pour cette date' : '' }}.</p>
        </li>
        <li v-for="t in tacheList" :key="t.id_tache" class="item-row">
          <div class="item-info">
            <div class="item-top">
              <div class="item-title">{{ TASK_LABELS[t.nom_tache] ?? t.nom_tache }}</div>
              <span :class="['status-badge', `status-${t.statut}`]">{{
                STATUT_LABELS[t.statut]
              }}</span>
            </div>
            <div class="item-meta">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              {{ t.date_tache }}
              <span v-if="t.heure" class="meta-separator">·</span>
              <span v-if="t.heure">{{ t.heure.slice(0, 5) }}</span>
            </div>
            <div v-if="t.commentaire" class="item-comment">
              <i class="fa-solid fa-quote-left" aria-hidden="true"></i> {{ t.commentaire }}
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Étapes ─────────────────────────────────────────────── -->
    <section v-if="activeTab === 'etapes'" aria-label="Étapes du patient">
      <ul class="item-list" role="list">
        <li v-if="etapeList.length === 0" class="item-empty">
          <div class="empty-icon"><i class="fa-solid fa-map-signs" aria-hidden="true"></i></div>
          <p>Aucune étape.</p>
        </li>
        <li v-for="e in etapeList" :key="e.id_etape" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ e.titre }}</div>
            <div class="item-meta">
              <i class="fa-regular fa-calendar-days" aria-hidden="true"></i>
              {{ e.date_debut }}
              <span v-if="e.date_fin" class="meta-arrow">→</span>
              <span v-if="e.date_fin">{{ e.date_fin }}</span>
            </div>
            <div v-if="e.checklist?.length" class="progress-bar-container">
              <div class="progress-text">
                <i class="fa-solid fa-list-check" aria-hidden="true"></i>
                {{ e.checklist.filter((c) => c.fait).length }}/{{ e.checklist.length }} éléments
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width:
                      (e.checklist.filter((c) => c.fait).length / e.checklist.length) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>
            <div v-if="e.detail" class="item-comment">{{ e.detail }}</div>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Rendez-vous ──────────────────────────────────────────── -->
    <section v-if="activeTab === 'rdv'" aria-label="Rendez-vous du patient">
      <ul class="item-list" role="list">
        <li v-if="rdvList.length === 0" class="item-empty">
          <div class="empty-icon">
            <i class="fa-regular fa-calendar-xmark" aria-hidden="true"></i>
          </div>
          <p>Aucun rendez-vous.</p>
        </li>
        <li v-for="r in rdvList" :key="r.id_rendezvous" class="item-row">
          <div class="item-info">
            <div class="item-top">
              <div class="item-title">
                <i class="fa-solid fa-user-doctor icon-prefix" aria-hidden="true"></i>
                Dr. {{ r.doctor_first_name }} {{ r.doctor_last_name }}
              </div>
              <span class="type-badge">{{ r.profession }}</span>
            </div>
            <div class="item-meta">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              {{ formatDateTime(r.starts_at) }}
            </div>
            <div v-if="r.address" class="item-comment">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i> {{ r.address }}
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Chirurgies ─────────────────────────────────────────── -->
    <section v-if="activeTab === 'chirurgies'" aria-label="Chirurgies du patient">
      <ul class="item-list" role="list">
        <li v-if="chirurgieList.length === 0" class="item-empty">
          <div class="empty-icon"><i class="fa-solid fa-bed-pulse" aria-hidden="true"></i></div>
          <p>Aucune chirurgie.</p>
        </li>
        <li v-for="c in chirurgieList" :key="c.id" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ c.titre }}</div>
            <div class="item-meta">
              <i class="fa-regular fa-calendar-check" aria-hidden="true"></i>
              {{ formatDateTime(c.date_chirurgie) }}
            </div>

            <div class="chirurgie-steps">
              <div class="step-item">
                <span class="step-label">Anesthésie</span>
                <span
                  :class="['step-indicator', c.salle_anesthesie ? 'step-done' : 'step-pending']"
                >
                  <i
                    :class="c.salle_anesthesie ? 'fa-solid fa-check' : 'fa-regular fa-circle'"
                    aria-hidden="true"
                  ></i>
                </span>
              </div>
              <div class="step-connector" :class="{ 'connector-done': c.salle_anesthesie }"></div>

              <div class="step-item">
                <span class="step-label">Opération</span>
                <span :class="['step-indicator', c.salle_operation ? 'step-done' : 'step-pending']">
                  <i
                    :class="c.salle_operation ? 'fa-solid fa-check' : 'fa-regular fa-circle'"
                    aria-hidden="true"
                  ></i>
                </span>
              </div>
              <div class="step-connector" :class="{ 'connector-done': c.salle_operation }"></div>

              <div class="step-item">
                <span class="step-label">Réveil</span>
                <span :class="['step-indicator', c.salle_reveil ? 'step-done' : 'step-pending']">
                  <i
                    :class="c.salle_reveil ? 'fa-solid fa-check' : 'fa-regular fa-circle'"
                    aria-hidden="true"
                  ></i>
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/lib/api.js';

const props = defineProps({ patient: { type: Object, required: true } });
defineEmits(['back']);

const pid = props.patient.id;
const activeTab = ref('taches');

const TABS = [
  { id: 'taches', label: 'Tâches' },
  { id: 'etapes', label: 'Étapes' },
  { id: 'rdv', label: 'Rendez-vous' },
  { id: 'chirurgies', label: 'Chirurgies' },
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
const chirurgieList = ref([]);

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
    api
      .get(`/api/aide/patients/${pid}/chirurgies`)
      .then((d) => (chirurgieList.value = d || []))
      .catch(() => {}),
  ]);
});
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
