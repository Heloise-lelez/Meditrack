<template>
  <main class="doc" role="main" aria-label="Page Documents médicaux">
    <header class="header">
      <h1>Chirurgie Suivi</h1>
      <p>Votre parcours chirurgical étape par étape</p>
    </header>

    <div class="container">
      <section class="documents-header" aria-label="En-tête documents">
        <h2 tabindex="0">Documents médicaux</h2>
        <div class="header-info">
          <span class="doc-count">{{ documents.length }} documents</span>
          <button
            class="upload-btn"
            aria-label="Ajouter un nouveau document"
            title="Ajouter"
            :disabled="uploading"
            @click="triggerFilePicker"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </button>
        </div>
      </section>

      <input
        ref="fileInput"
        type="file"
        accept="application/pdf,image/*"
        style="display: none"
        @change="onFileSelected"
      />

      <nav class="category-filters" role="tablist" aria-label="Filtrer les documents par catégorie">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['filter-btn', { active: activeCategory === category.id }]"
          :role="'tab'"
          :aria-label="`Filtrer par ${category.label}`"
          :aria-selected="activeCategory === category.id"
          @click="activeCategory = category.id"
        >
          {{ category.label }}
        </button>
      </nav>

      <section class="documents-list" aria-label="Liste des documents">
        <p v-if="loading" style="color: #6b7280; font-size: 12px; margin: 6px 0">Chargement…</p>
        <p v-else-if="errorMessage" style="color: #b91c1c; font-size: 12px; margin: 6px 0">
          {{ errorMessage }}
        </p>

        <article v-for="doc in filteredDocuments" :key="doc.id" class="document-card">
          <div class="doc-header">
            <div class="doc-icon" aria-hidden="true">📋</div>

            <div class="doc-content">
              <h3 class="doc-title" tabindex="0">{{ doc.title }}</h3>
              <span class="doc-category" :class="`category-${doc.category.toLowerCase()}`">
                {{ doc.category }}
              </span>
              <div class="doc-meta">
                <span>{{ doc.date }}</span>
                <span>•</span>
                <span>{{ doc.size }}</span>
              </div>
            </div>
          </div>

          <div class="doc-actions">
            <button
              class="action-btn view-btn"
              :aria-label="`Voir le document ${doc.title}`"
              title="Voir"
              @click="openDoc(doc)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>Voir</span>
            </button>
            <button
              class="action-btn download-btn"
              :aria-label="`Télécharger le document ${doc.title}`"
              title="Télécharger"
              @click="downloadDoc(doc)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              <span>Télécharger</span>
            </button>
            <button
              class="action-btn delete-btn"
              :aria-label="`Supprimer le document ${doc.title}`"
              title="Supprimer"
              @click="deleteDoc(doc)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              <span>Supprimer</span>
            </button>
          </div>
        </article>
      </section>
    </div>

    <div
      v-if="isUploadModalOpen"
      role="dialog"
      aria-modal="true"
      aria-label="Ajouter un document"
      style="
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        z-index: 50;
      "
      @click.self="closeUploadModal"
    >
      <div
        style="
          background: #fff;
          border-radius: 14px;
          max-width: 560px;
          width: 100%;
          padding: 20px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        "
      >
        <div
          style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px"
        >
          <div>
            <h3 style="margin: 0; font-size: 16px" tabindex="0">Ajouter un document</h3>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 12px">
              {{ selectedFile?.name }} • {{ selectedFileHumanSize }}
            </p>
          </div>
          <button
            class="action-btn"
            style="flex: 0 0 auto; background: #f3f4f6; color: #111827"
            type="button"
            aria-label="Fermer la fenêtre d'ajout de document"
            @click="closeUploadModal"
            :disabled="uploading"
          >
            Fermer
          </button>
        </div>

        <form
          aria-label="Formulaire d'ajout de document"
          style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px"
          @submit.prevent="submitUpload"
        >
          <label
            style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
          >
            Titre
            <input
              v-model.trim="uploadForm.title"
              required
              type="text"
              aria-label="Titre du document"
              placeholder="Ex: Compte rendu opératoire"
              style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
              :disabled="uploading"
            />
          </label>

          <label
            style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
          >
            Catégorie
            <select
              v-model="uploadForm.type"
              required
              aria-label="Catégorie du document"
              style="
                border: 1px solid #e5e7eb;
                border-radius: 10px;
                padding: 10px;
                font-size: 14px;
                background: #fff;
              "
              :disabled="uploading"
            >
              <option value="" disabled>Choisir…</option>
              <option value="Chirurgie">Chirurgie</option>
              <option value="Ordonnances">Ordonnances</option>
              <option value="Examens">Examens</option>
              <option value="Administratif">Administratif</option>
            </select>
          </label>

          <label
            style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #374151"
          >
            Date de publication
            <input
              v-model="uploadForm.publicationDate"
              type="date"
              style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 14px"
              :disabled="uploading"
            />
          </label>

          <p v-if="uploadErrorMessage" style="margin: 0; color: #b91c1c; font-size: 12px">
            {{ uploadErrorMessage }}
          </p>

          <button
            class="action-btn view-btn"
            type="submit"
            :disabled="uploading || !selectedFile"
            style="width: 100%"
          >
            {{ uploading ? 'Envoi…' : 'Ajouter' }}
          </button>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import './Doc.css';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';

const activeCategory = ref('all');

const categories = [
  { id: 'all', label: 'Tous' },
  { id: 'chirurgie', label: 'Chirurgie' },
  { id: 'ordonnances', label: 'Ordonnances' },
  { id: 'examens', label: 'Examens' },
  { id: 'administratif', label: 'Administratif' },
];

const documents = ref([]);
const loading = ref(true);
const errorMessage = ref(null);

const fileInput = ref(null);
const selectedFile = ref(null);
const isUploadModalOpen = ref(false);
const uploading = ref(false);
const uploadErrorMessage = ref(null);
const uploadForm = ref({
  title: '',
  type: '',
  publicationDate: '',
});

const loadDocuments = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const data = await api.get('/api/documents');
    documents.value = (data || []).map((row) => ({
      id: row.id_document,
      title: row.titre,
      category: row.type,
      date: row.publication_date
        ? new Date(row.publication_date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : '',
      size: row.size_kb ? `${row.size_kb} KB` : '',
      downloadLink: row.download_link ?? null,
    }));
  } catch (err) {
    console.error('Erreur lors du chargement des documents :', err);
    errorMessage.value = 'Impossible de charger les documents.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDocuments();
});

const filteredDocuments = computed(() => {
  if (activeCategory.value === 'all') {
    return documents.value;
  }
  return documents.value.filter(
    (doc) => doc.category && doc.category.toLowerCase() === activeCategory.value
  );
});

const selectedFileHumanSize = computed(() => {
  if (!selectedFile.value) return '';
  const size = selectedFile.value.size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
});

const triggerFilePicker = () => {
  uploadErrorMessage.value = null;
  fileInput.value?.click();
};

const closeUploadModal = () => {
  if (uploading.value) return;
  isUploadModalOpen.value = false;
  selectedFile.value = null;
  uploadErrorMessage.value = null;
  uploadForm.value = { title: '', type: '', publicationDate: '' };
  if (fileInput.value) fileInput.value.value = '';
};

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  selectedFile.value = file;
  uploadForm.value.title = file.name.replace(/\.[^/.]+$/, '');
  uploadForm.value.type = '';
  uploadForm.value.publicationDate = new Date().toISOString().slice(0, 10);
  isUploadModalOpen.value = true;
};

const submitUpload = async () => {
  uploadErrorMessage.value = null;
  if (!selectedFile.value) {
    uploadErrorMessage.value = 'Veuillez sélectionner un fichier.';
    return;
  }
  if (!uploadForm.value.title || !uploadForm.value.type) {
    uploadErrorMessage.value = 'Veuillez renseigner le titre et la catégorie.';
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('titre', uploadForm.value.title);
    formData.append('type', uploadForm.value.type);
    if (uploadForm.value.publicationDate) {
      formData.append('publication_date', uploadForm.value.publicationDate);
    }

    const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch(`${BASE}/api/documents/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      uploadErrorMessage.value = json.error ?? "Échec de l'envoi du fichier.";
      return;
    }

    await loadDocuments();
    closeUploadModal();
  } catch (err) {
    console.error(err);
    uploadErrorMessage.value = "Erreur réseau lors de l'envoi du fichier.";
  } finally {
    uploading.value = false;
  }
};

async function fetchDocBlob(doc) {
  if (!doc?.id) return null;
  try {
    const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const res = await fetch(`${BASE}/api/documents/${doc.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.blob();
  } catch (err) {
    console.error('Impossible de télécharger le document :', err);
    return null;
  }
}

const openDoc = async (doc) => {
  const blob = await fetchDocBlob(doc);
  if (!blob) {
    alert("Aucun lien de document n'est disponible.");
    return;
  }
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const deleteDoc = async (doc) => {
  if (!confirm(`Supprimer "${doc.title}" ?`)) return;
  try {
    await api.delete(`/api/documents/${doc.id}`);
    await loadDocuments();
  } catch (err) {
    console.error(err);
    errorMessage.value = 'Impossible de supprimer le document.';
  }
};

const downloadDoc = async (doc) => {
  const blob = await fetchDocBlob(doc);
  if (!blob) {
    alert("Aucun lien de téléchargement n'est disponible.");
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.title || 'document';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
</script>
