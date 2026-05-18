<template>
  <main class="home" role="main" aria-label="Page d'accueil">
    <!-- Header -->
    <header class="header">
      <h1>Chirurgie Suivi</h1>
      <p>Votre parcours chirurgical étape par étape</p>
    </header>

    <!-- Content -->
    <div class="container">
      <!-- Greeting -->
      <section class="greeting" aria-label="Accueil personnalisé">
       <h2>Bonjour</h2>
        <p>Voici votre suivi du jour</p>
      </section>

      <!-- Status Badge -->
      <section class="status-badge" role="status" aria-live="polite">
        <span>Statut : Convalescence - Jour 3 post-op</span>
      </section>

      <!-- Next Appointment -->
      <section class="appointment-card" aria-label="Prochain rendez-vous">
        <header class="appointment-header">
          <h2 class="appointment-label" tabindex="0">Prochain rendez-vous</h2>
        </header>
        <article class="appointment-doctor">
          <h3 v-if="nextRdv" tabindex="0">Dr. {{ nextRdv.prenom }} {{ nextRdv.nom }}</h3>
          <h3 v-else tabindex="0">Aucun rendez-vous</h3>
          <p class="specialty" v-if="nextRdv">{{ nextRdv.profession }}</p>
          <p class="description" v-if="nextRdv">{{ nextRdv.operation }}</p>
          <p class="description" v-else>Ajoute ton premier rendez-vous dans l’onglet “Rendez-vous”.</p>
        </article>
        <div class="appointment-divider" role="presentation"></div>
        <div class="appointment-details">
          <div class="detail-item">
            <span class="detail-label" id="appointment-date-label">Date</span>
            <span class="detail-value" aria-labelledby="appointment-date-label">
              {{ nextRdv ? nextRdv.dateShort : '—' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label" id="appointment-time-label">Heure</span>
            <span class="detail-value" aria-labelledby="appointment-time-label">
              {{ nextRdv ? nextRdv.heure : '—' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Tasks Section -->
      <section class="section" aria-label="Tâches du jour">
        <header class="section-header">
          <h2 tabindex="0">Tâches du jour</h2>
          <span class="count" aria-label="3 tâches à accomplir">3 tâches</span>
        </header>

        <ul class="tasks" role="list">
          <li class="task" role="listitem">
            <div class="task-left">
              <div class="task-indicator done" aria-hidden="true"></div>
              <div class="task-info">
                <div class="task-title">Soins de la plaie</div>
                <time class="task-time">09:00</time>
              </div>
            </div>
            <span class="task-status done" aria-label="Tâche accompllie">Fait</span>
          </li>

          <li class="task" role="listitem">
            <div class="task-left">
              <div class="task-indicator pending" aria-hidden="true"></div>
              <div class="task-info">
                <div class="task-title">Prise médicament anti-douleur</div>
                <time class="task-time">12:00</time>
              </div>
            </div>
            <span class="task-status pending" aria-label="Tâche à faire">À faire</span>
          </li>

          <li class="task" role="listitem">
            <div class="task-left">
              <div class="task-indicator pending" aria-hidden="true"></div>
              <div class="task-info">
                <div class="task-title">Exercices de mobilisation</div>
                <time class="task-time">15:00</time>
              </div>
            </div>
            <span class="task-status pending" aria-label="Tâche à faire">À faire</span>
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
              <div class="doc-meta">Ajoute tes documents dans l’onglet “Documents”.</div>
            </div>
          </li>

          <li
            v-for="doc in recentDocs"
            :key="doc.id"
            class="document"
            role="listitem"
          >
            <div class="doc-icon" aria-hidden="true">📄</div>
            <div class="doc-info">
              <div class="doc-title">{{ doc.title }}</div>
              <div class="doc-meta">
                {{ doc.date }} · {{ doc.type }}
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import './home.css';
import { api } from '../../lib/api';

const nextRdv = ref(null);
const recentDocs = ref([]);

const loadNextRdv = async () => {
  try {
    const data = await api.get('/api/rendezvous/next');
    if (!data) {
      nextRdv.value = null;
      return;
    }
    const d = new Date(data.starts_at);
    nextRdv.value = {
      prenom: data.doctor_first_name,
      nom: data.doctor_last_name,
      profession: data.profession,
      operation: data.operation,
      dateShort: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.error(err);
    nextRdv.value = null;
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
  } catch (err) {
    console.error(err);
    recentDocs.value = [];
  }
};

onMounted(() => {
  loadNextRdv();
  loadRecentDocs();
});
</script>
