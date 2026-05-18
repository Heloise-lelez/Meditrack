<template>
  <div class="detail" :aria-label="`Dossier de ${patient.prenom} ${patient.nom}`">
    <!-- Header -->
    <header class="detail-header">
      <button class="back-btn" @click="$emit('back')" aria-label="Retour à la liste">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        Retour
      </button>
      <h1>{{ patient.prenom }} {{ patient.nom }}</h1>
    </header>

    <!-- Sub-tabs -->
    <nav class="sub-tabs" role="tablist" aria-label="Sections du dossier">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        class="sub-tab"
        :class="{ active: activeTab === tab.id }"
        role="tab"
        :aria-selected="activeTab === tab.id"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </nav>

    <!-- ── Rendez-vous ──────────────────────────────────────── -->
    <section v-if="activeTab === 'rdv'" class="section" aria-label="Rendez-vous du patient">
      <div class="section-actions">
        <button class="btn-primary" @click="showRdvForm = true">+ Nouveau rendez-vous</button>
      </div>

      <form v-if="showRdvForm" class="inline-form" @submit.prevent="createRdv">
        <h3>Nouveau rendez-vous</h3>
        <div class="form-grid">
          <label>Prénom médecin<input v-model="rdvForm.doctor_first_name" required /></label>
          <label>Nom médecin<input v-model="rdvForm.doctor_last_name" required /></label>
          <label>Spécialité<input v-model="rdvForm.profession" required /></label>
          <label>Motif<input v-model="rdvForm.operation" required /></label>
          <label>Adresse<input v-model="rdvForm.address" required /></label>
          <label>Date & heure<input type="datetime-local" v-model="rdvForm.starts_at" required /></label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="submitting">Créer</button>
          <button type="button" class="btn-secondary" @click="showRdvForm = false">Annuler</button>
        </div>
      </form>

      <ul class="item-list" role="list">
        <li v-if="rdvList.length === 0" class="item-empty">Aucun rendez-vous.</li>
        <li v-for="r in rdvList" :key="r.id_rendezvous" class="item-row">
          <div class="item-info">
            <div class="item-title">Dr. {{ r.doctor_first_name }} {{ r.doctor_last_name }}</div>
            <div class="item-meta">{{ formatDateTime(r.starts_at) }} · {{ r.operation }}</div>
          </div>
          <button class="btn-delete" aria-label="Supprimer le rendez-vous" @click="deleteRdv(r.id_rendezvous)">✕</button>
        </li>
      </ul>
    </section>

    <!-- ── Tâches ────────────────────────────────────────────── -->
    <section v-if="activeTab === 'taches'" class="section" aria-label="Tâches du patient">
      <div class="section-actions">
        <!-- FIX: filtre optionnel, pas de max, bouton effacer -->
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
          @click="tacheDate = ''; loadTaches()"
        >Toutes les dates</button>
        <button class="btn-primary" @click="showTacheForm = true">+ Nouvelle tâche</button>
      </div>

      <form v-if="showTacheForm" class="inline-form" @submit.prevent="createTache">
        <h3>Nouvelle tâche</h3>
        <div class="form-grid">
          <label>Type de tâche
            <select v-model="tacheForm.nom_tache" required>
              <option v-for="(label, val) in TASK_LABELS" :key="val" :value="val">{{ label }}</option>
            </select>
          </label>
          <label>Date<input type="date" v-model="tacheForm.date_tache" required /></label>
          <label>Heure (optionnel)<input type="time" v-model="tacheForm.heure" /></label>
          <label>Commentaire<input v-model="tacheForm.commentaire" /></label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="submitting">Créer</button>
          <button type="button" class="btn-secondary" @click="showTacheForm = false">Annuler</button>
        </div>
      </form>

      <ul class="item-list" role="list">
        <li v-if="tacheList.length === 0" class="item-empty">Aucune tâche{{ tacheDate ? ' pour cette date' : '' }}.</li>
        <li v-for="t in tacheList" :key="t.id_tache" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ TASK_LABELS[t.nom_tache] ?? t.nom_tache }}</div>
            <div class="item-meta">
              {{ t.date_tache }}{{ t.heure ? ' · ' + t.heure.slice(0, 5) : '' }} ·
              <span :class="`statut-${t.statut}`">{{ STATUT_LABELS[t.statut] }}</span>
            </div>
            <div v-if="t.commentaire" class="item-comment">{{ t.commentaire }}</div>
          </div>
          <button class="btn-delete" aria-label="Supprimer la tâche" @click="deleteTache(t.id_tache)">✕</button>
        </li>
      </ul>
    </section>

    <!-- ── Étapes ─────────────────────────────────────────────── -->
    <section v-if="activeTab === 'etapes'" class="section" aria-label="Étapes du patient">
      <div class="section-actions">
        <button class="btn-primary" @click="showEtapeForm = true">+ Nouvelle étape</button>
      </div>

      <!-- FIX: formulaire avec gestion de la checklist -->
      <form v-if="showEtapeForm" class="inline-form" @submit.prevent="createEtape">
        <h3>Nouvelle étape</h3>
        <div class="form-grid">
          <label>Titre<input v-model="etapeForm.titre" required /></label>
          <label>Description<input v-model="etapeForm.detail" /></label>
          <label>Date début<input type="date" v-model="etapeForm.date_debut" required /></label>
          <label>Date fin (optionnel)<input type="date" v-model="etapeForm.date_fin" /></label>
        </div>

        <div class="checklist-builder">
          <p class="checklist-label">Éléments de checklist</p>
          <div v-for="(item, i) in etapeForm.checklist" :key="i" class="checklist-row">
            <input
              v-model="item.label"
              :placeholder="`Élément ${i + 1}`"
              class="checklist-input"
            />
            <button type="button" class="btn-delete" :aria-label="`Supprimer l'élément ${i + 1}`" @click="etapeForm.checklist.splice(i, 1)">✕</button>
          </div>
          <button
            type="button"
            class="btn-add-item"
            @click="etapeForm.checklist.push({ label: '', fait: false })"
          >+ Ajouter un élément</button>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="submitting">Créer</button>
          <button type="button" class="btn-secondary" @click="showEtapeForm = false">Annuler</button>
        </div>
      </form>

      <ul class="item-list" role="list">
        <li v-if="etapeList.length === 0" class="item-empty">Aucune étape.</li>
        <li v-for="e in etapeList" :key="e.id_etape" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ e.titre }}</div>
            <div class="item-meta">
              {{ e.date_debut }}{{ e.date_fin ? ' → ' + e.date_fin : '' }}
              <span v-if="e.checklist?.length" class="checklist-count"> · {{ e.checklist.filter(c => c.fait).length }}/{{ e.checklist.length }} éléments</span>
            </div>
          </div>
          <button class="btn-delete" aria-label="Supprimer l'étape" @click="deleteEtape(e.id_etape)">✕</button>
        </li>
      </ul>
    </section>

    <!-- ── Documents ─────────────────────────────────────────── -->
    <section v-if="activeTab === 'documents'" class="section" aria-label="Documents du patient">
      <div class="section-actions">
        <button class="btn-primary" @click="showDocForm = true">+ Nouveau document</button>
      </div>

      <!-- FIX: formulaire avec input fichier -->
      <form v-if="showDocForm" class="inline-form" @submit.prevent="createDoc">
        <h3>Nouveau document</h3>
        <div class="form-grid">
          <label>Titre<input v-model="docForm.titre" required /></label>
          <label>Type
            <select v-model="docForm.type" required>
              <option value="Chirurgie">Chirurgie</option>
              <option value="Ordonnances">Ordonnances</option>
              <option value="Examens">Examens</option>
              <option value="Administratif">Administratif</option>
            </select>
          </label>
          <label>Date de publication<input type="date" v-model="docForm.publication_date" /></label>
          <label class="file-label">
            Fichier <span class="file-hint">(PDF, image – max 10 Mo)</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
              class="file-input"
              required
              @change="selectedDocFile = $event.target.files[0]"
            />
          </label>
        </div>
        <p v-if="selectedDocFile" class="file-selected">📎 {{ selectedDocFile.name }}</p>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="submitting">Envoyer</button>
          <button type="button" class="btn-secondary" @click="cancelDocForm">Annuler</button>
        </div>
      </form>

      <ul class="item-list" role="list">
        <li v-if="docList.length === 0" class="item-empty">Aucun document.</li>
        <li v-for="d in docList" :key="d.id_document" class="item-row">
          <div class="item-info">
            <div class="item-title">{{ d.titre }}</div>
            <div class="item-meta">{{ d.type }}{{ d.publication_date ? ' · ' + d.publication_date : '' }}{{ d.size_kb ? ' · ' + d.size_kb + ' Ko' : '' }}</div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../../lib/api';
import './doctor.css';

const props = defineProps({ patient: { type: Object, required: true } });
defineEmits(['back']);

const pid = props.patient.id;
const activeTab = ref('rdv');

const TABS = [
  { id: 'rdv', label: 'Rendez-vous' },
  { id: 'taches', label: 'Tâches' },
  { id: 'etapes', label: 'Étapes' },
  { id: 'documents', label: 'Documents' },
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

// FIX Bug 1: filtre de date vide par défaut → toutes les tâches sont chargées
const tacheDate = ref('');

const rdvList = ref([]);
const tacheList = ref([]);
const etapeList = ref([]);
const docList = ref([]);
const submitting = ref(false);

const showRdvForm = ref(false);
const showTacheForm = ref(false);
const showEtapeForm = ref(false);
const showDocForm = ref(false);

const today = new Date().toISOString().slice(0, 10);

const rdvForm = ref({ doctor_first_name: '', doctor_last_name: '', profession: '', operation: '', address: '', starts_at: '' });
const tacheForm = ref({ nom_tache: 'consultation', date_tache: today, heure: '', commentaire: '' });
// FIX Bug 3: checklist dans le formulaire étape
const etapeForm = ref({ titre: '', detail: '', date_debut: '', date_fin: '', checklist: [] });
const docForm = ref({ titre: '', type: 'Chirurgie', publication_date: '' });
// FIX Bug 2: fichier sélectionné pour l'upload document
const selectedDocFile = ref(null);

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// ── Loaders ─────────────────────────────────────────────────────────────────
const loadRdv = async () => { rdvList.value = await api.get(`/api/doctor/patients/${pid}/rendezvous`); };

// FIX Bug 1: n'envoie ?date= que si une date est sélectionnée
const loadTaches = async () => {
  const qs = tacheDate.value ? `?date=${tacheDate.value}` : '';
  tacheList.value = await api.get(`/api/doctor/patients/${pid}/taches${qs}`);
};

const loadEtapes = async () => { etapeList.value = await api.get(`/api/doctor/patients/${pid}/etapes`); };
const loadDocs = async () => { docList.value = await api.get(`/api/doctor/patients/${pid}/documents`); };

// ── Actions RDV ──────────────────────────────────────────────────────────────
const createRdv = async () => {
  submitting.value = true;
  try {
    await api.post(`/api/doctor/patients/${pid}/rendezvous`, rdvForm.value);
    showRdvForm.value = false;
    rdvForm.value = { doctor_first_name: '', doctor_last_name: '', profession: '', operation: '', address: '', starts_at: '' };
    await loadRdv();
  } catch (e) { alert(e.message); }
  finally { submitting.value = false; }
};

const deleteRdv = async (id) => {
  if (!confirm('Supprimer ce rendez-vous ?')) return;
  await api.delete(`/api/doctor/patients/${pid}/rendezvous/${id}`);
  await loadRdv();
};

// ── Actions Tâches ───────────────────────────────────────────────────────────
const createTache = async () => {
  submitting.value = true;
  try {
    const body = { ...tacheForm.value, heure: tacheForm.value.heure || null, commentaire: tacheForm.value.commentaire || null };
    await api.post(`/api/doctor/patients/${pid}/taches`, body);
    showTacheForm.value = false;
    await loadTaches();
  } catch (e) { alert(e.message); }
  finally { submitting.value = false; }
};

const deleteTache = async (id) => {
  if (!confirm('Supprimer cette tâche ?')) return;
  await api.delete(`/api/doctor/patients/${pid}/taches/${id}`);
  await loadTaches();
};

// ── Actions Étapes ───────────────────────────────────────────────────────────
const createEtape = async () => {
  submitting.value = true;
  try {
    const body = {
      ...etapeForm.value,
      date_fin: etapeForm.value.date_fin || null,
      detail: etapeForm.value.detail || null,
      // FIX Bug 3: filtrer les items vides
      checklist: etapeForm.value.checklist.filter(i => i.label.trim()).map(i => ({ label: i.label.trim(), fait: false })),
    };
    await api.post(`/api/doctor/patients/${pid}/etapes`, body);
    showEtapeForm.value = false;
    etapeForm.value = { titre: '', detail: '', date_debut: '', date_fin: '', checklist: [] };
    await loadEtapes();
  } catch (e) { alert(e.message); }
  finally { submitting.value = false; }
};

const deleteEtape = async (id) => {
  if (!confirm('Supprimer cette étape ?')) return;
  await api.delete(`/api/doctor/patients/${pid}/etapes/${id}`);
  await loadEtapes();
};

// ── Actions Documents ────────────────────────────────────────────────────────
// FIX Bug 2: upload multipart/form-data
const createDoc = async () => {
  if (!selectedDocFile.value) { alert('Veuillez sélectionner un fichier.'); return; }
  submitting.value = true;
  try {
    const fd = new FormData();
    fd.append('titre', docForm.value.titre);
    fd.append('type', docForm.value.type);
    if (docForm.value.publication_date) fd.append('publication_date', docForm.value.publication_date);
    fd.append('file', selectedDocFile.value);

    await api.postForm(`/api/doctor/patients/${pid}/documents/upload`, fd);
    cancelDocForm();
    await loadDocs();
  } catch (e) { alert(e.message); }
  finally { submitting.value = false; }
};

const cancelDocForm = () => {
  showDocForm.value = false;
  docForm.value = { titre: '', type: 'Chirurgie', publication_date: '' };
  selectedDocFile.value = null;
};

onMounted(() => { loadRdv(); loadTaches(); loadEtapes(); loadDocs(); });
</script>
