<template>
  <main class="home" role="main" aria-label="Page d'accueil">
    <!-- Content -->
    <div class="container">
      <!-- Greeting -->
      <section class="greeting" aria-label="Accueil personnalisé">
        <h2>Bonjour {{ userFirstName }} {{ userLastName }}</h2>
        <p>Voici votre suivi du jour</p>
      </section>

      <!-- Next Appointment -->
      <section class="appointment-card" aria-label="Prochain rendez-vous">
        <header class="appointment-header">
          <h2 class="appointment-label" tabindex="0">
            <i class="fa-solid fa-calendar-days"></i> Prochain rendez-vous
          </h2>
        </header>
        <article class="appointment-doctor">
          <h3 v-if="nextRdv" tabindex="0">
            <i class="fa-solid fa-user-doctor"></i> Dr. {{ nextRdv.prenom }} {{ nextRdv.nom }}
          </h3>
          <h3 v-else tabindex="0">Aucun rendez-vous</h3>
          <p class="specialty" v-if="nextRdv">{{ nextRdv.profession }}</p>
          <p class="description" v-if="nextRdv">
            <i class="fa-solid fa-stethoscope"></i> {{ nextRdv.operation }}
          </p>
          <p class="description" v-else>
            Ajoute ton premier rendez-vous dans l'onglet "Rendez-vous".
          </p>
        </article>
        <div class="appointment-divider" role="presentation"></div>
        <div class="appointment-details">
          <div class="detail-item">
            <span class="detail-label" id="appointment-date-label">Date</span>
            <span class="detail-value" aria-labelledby="appointment-date-label">
              <i class="fa-regular fa-calendar"></i> {{ nextRdv ? nextRdv.dateShort : '—' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label" id="appointment-time-label">Heure</span>
            <span class="detail-value" aria-labelledby="appointment-time-label">
              <i class="fa-regular fa-clock"></i> {{ nextRdv ? nextRdv.heure : '—' }}
            </span>
          </div>
        </div>
        <div class="appointment-divider" role="presentation"></div>
        <div
          class="appointment-checklist-container"
          v-if="nextRdv && nextRdv.checklist && nextRdv.checklist.length"
          role="region"
          aria-label="Tâches à faire avant le rendez-vous"
        >
          <h3 class="checklist-header" id="checklist-title">
            Tâches à faire avant le rendez-vous :
          </h3>
          <ul class="appointment-checklist" role="list" aria-labelledby="checklist-title">
            <li
              v-for="task in nextRdv.checklist"
              :key="task.id"
              class="checklist-item"
              :class="{ 'checklist-item--done': task.fait }"
              role="listitem"
            >
              <button
                @click="toggleChecklistTask(task)"
                class="checklist-checkbox"
                :aria-label="`${task.label} - ${task.fait ? 'Complété' : 'À faire'}`"
                :aria-pressed="task.fait"
                type="button"
              >
                <span aria-hidden="true" v-if="task.fait">✓</span>
                <span class="sr-only">{{ task.fait ? 'Complété' : 'Non complété' }}</span>
              </button>
              <span class="next-rdv__task">
                {{ task.label }}
              </span>
              <span
                class="checklist-status"
                :class="{ 'checklist-status--done': task.fait }"
                aria-live="polite"
              >
                {{ task.fait ? 'Fait' : 'À faire' }}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Tasks Section -->
      <section class="section" aria-label="Tâches du jour">
        <header class="section-header">
          <h2 tabindex="0">Tâches du jour</h2>
          <span v-if="taches.length" class="count" :aria-label="`${taches.length} tâches`"
            >{{ taches.length }} tâche{{ taches.length > 1 ? 's' : '' }}</span
          >
        </header>

        <ul class="tasks" role="list">
          <li v-if="taches.length === 0" class="task" role="listitem">
            <div class="task-left">
              <div class="task-indicator pending" aria-hidden="true"></div>
              <div class="task-info">
                <div class="task-title">Aucune tâche pour aujourd'hui</div>
              </div>
            </div>
          </li>

          <li v-for="tache in taches" :key="tache.id_tache" class="task" role="listitem">
            <div class="task-left">
              <div
                class="task-indicator"
                :class="tache.statut === 'fait' ? 'done' : 'pending'"
                aria-hidden="true"
              ></div>
              <div class="task-info">
                <div class="task-title">{{ TASK_LABELS[tache.nom_tache] ?? tache.nom_tache }}</div>
                <time v-if="tache.heure" class="task-time">{{ tache.heure.slice(0, 5) }}</time>
                <p v-if="tache.commentaire" class="task-comment">{{ tache.commentaire }}</p>
              </div>
            </div>
            <button
              class="task-status"
              :class="tache.statut === 'fait' ? 'done' : 'pending'"
              :aria-label="tache.statut === 'fait' ? 'Marquer comme à faire' : 'Marquer comme fait'"
              @click="toggleTache(tache)"
            >
              {{
                tache.statut === 'fait' ? 'Fait' : tache.statut === 'ratee' ? 'Ratée' : 'À faire'
              }}
            </button>
          </li>
        </ul>
      </section>

      <!-- Documents Section -->
      <section class="section" aria-label="Documents récents">
        <header class="section-header">
          <h2 id="recent-docs-title" tabindex="0">Documents récents</h2>
        </header>

        <ul class="documents" role="list">
          <li v-if="recentDocs.length === 0" class="document" role="listitem">
            <div class="doc-icon" aria-hidden="true">📄</div>
            <div class="doc-info">
              <div class="doc-title">Aucun document récent</div>
              <div class="doc-meta">Ajoute tes documents dans l'onglet "Documents".</div>
            </div>
          </li>

          <li v-for="doc in recentDocs" :key="doc.id" class="document" role="listitem">
            <div class="doc-icon" aria-hidden="true">📄</div>
            <div class="doc-info">
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-meta">{{ doc.date }} · {{ doc.type }}</div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import './home.css';
import { api } from '../../lib/api';
import { useAuth } from '../../composables/useAuth';

const { user } = useAuth();

const userFirstName = computed(() => user.value?.user_metadata?.prenom || '');
const userLastName = computed(() => user.value?.user_metadata?.nom || '');

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

const nextRdv = ref(null);
const recentDocs = ref([]);
const taches = ref([]);

const todayISO = () => new Date().toISOString().slice(0, 10);

const loadNextRdv = async () => {
  try {
    const data = await api.get('/api/rendezvous/next');
    if (!data) {
      nextRdv.value = null;
      return;
    }
    const d = new Date(data.starts_at);
    console.warn('Next RDV data:', data);
    nextRdv.value = {
      id: data.id_rendezvous,
      prenom: data.doctor_first_name,
      nom: data.doctor_last_name,
      profession: data.profession,
      operation: data.operation,
      dateShort: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      checklist: data.checklist || [],
    };
  } catch {
    nextRdv.value = null;
  }
};

const loadTaches = async () => {
  try {
    taches.value = await api.get(`/api/taches?date=${todayISO()}`);
  } catch {
    taches.value = [];
  }
};

const toggleTache = async (tache) => {
  const newStatut = tache.statut === 'fait' ? 'a_faire' : 'fait';
  try {
    const updated = await api.put(`/api/taches/${tache.id_tache}`, { statut: newStatut });
    tache.statut = updated.statut;
  } catch {
    // keep UI consistent on failure
  }
};

const toggleChecklistTask = async (task) => {
  const previousValue = task.fait;
  task.fait = !previousValue;
  try {
    await api.put(`/api/rendezvous/${nextRdv.value.id}`, {
      checklist: nextRdv.value.checklist,
    });
  } catch (err) {
    // Revert on failure
    console.error('Erreur mise à jour checklist:', err);
    task.fait = previousValue;
  }
};

const loadRecentDocs = async () => {
  try {
    const data = await api.get('/api/documents?limit=3');
    recentDocs.value = (data || []).map((row) => ({
      id: row.id_document,
      title: row.titre,
      type: row.type,
      date: row.publication_date
        ? new Date(row.publication_date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '',
    }));
  } catch {
    recentDocs.value = [];
  }
};

onMounted(() => {
  loadNextRdv();
  loadTaches();
  loadRecentDocs();
});
</script>
