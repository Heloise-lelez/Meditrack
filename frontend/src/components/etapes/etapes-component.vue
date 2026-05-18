<template>
    <Header />
    <div class="etapes-container" role="main" aria-label="Conteneur des étapes">
        <section class="etapes-header" aria-labelledby="etapes-title">
            <h2 id="etapes-title" tabindex="0">Étapes</h2>
        </section>

        <div v-if="loading" class="etapes-loading" role="status" aria-label="Chargement des étapes">
            <div class="spinner" aria-hidden="true"></div>
        </div>

        <p v-else-if="etapes.length === 0" class="etapes-empty">
            Aucune étape pour le moment.
        </p>

        <div v-else class="etapes-cards" role="list" aria-label="Liste des étapes de suivi">
            <Cards
                v-for="etape in etapes"
                :key="etape.id_etape"
                :title="etape.titre"
                :description="etape.detail ?? ''"
                :date="formatDate(etape.date_debut, etape.date_fin)"
                :steps="etape.checklist.map(item => ({ label: item.label, done: item.fait }))"
                @toggle-step="(index) => toggleStep(etape, index)"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import './etapes.css';
import Header from '../Chirurgie_Suivi/Header.vue';
import Cards from './cards/cards-component.vue';
import { api } from '../../lib/api';

const etapes = ref([]);
const loading = ref(true);

const loadEtapes = async () => {
    try {
        const data = await api.get('/api/etapes');
        etapes.value = (data || []).map((e) => ({
            ...e,
            checklist: Array.isArray(e.checklist) ? e.checklist : [],
        }));
    } catch {
        etapes.value = [];
    } finally {
        loading.value = false;
    }
};

const formatDate = (debut, fin) => {
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    const start = new Date(debut).toLocaleDateString('fr-FR', opts);
    if (!fin) return start;
    const end = new Date(fin).toLocaleDateString('fr-FR', opts);
    return `${start} – ${end}`;
};

const toggleStep = async (etape, index) => {
    etape.checklist[index].fait = !etape.checklist[index].fait;
    try {
        await api.put(`/api/etapes/${etape.id_etape}`, { checklist: etape.checklist });
    } catch {
        // Revert on failure
        etape.checklist[index].fait = !etape.checklist[index].fait;
    }
};

onMounted(loadEtapes);
</script>

<style src="./etapes.css" scoped></style>
<style scoped>
.etapes-loading {
    display: flex;
    justify-content: center;
    padding: 40px 0;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #d1faf5;
    border-top-color: #3a8d7a;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.etapes-empty {
    text-align: center;
    color: #888;
    padding: 40px 16px;
}
</style>
