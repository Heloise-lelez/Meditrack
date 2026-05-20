<template>
  <nav v-if="totalPages > 1" class="pagination" role="navigation" aria-label="Pagination">
    <span class="pagination-info">
      Affichage {{ startItem }}–{{ endItem }} sur {{ totalItems }}
    </span>

    <div class="pagination-controls">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        aria-label="Page précédente"
        @click="goTo(currentPage - 1)"
      >
        ‹ Précédent
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination-btn"
        :class="{ active: page === currentPage, ellipsis: page === '...' }"
        :disabled="page === '...'"
        :aria-label="page === '...' ? undefined : `Page ${page}`"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="page !== '...' && goTo(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        aria-label="Page suivante"
        @click="goTo(currentPage + 1)"
      >
        Suivant ›
      </button>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  pageSize: { type: Number, required: true },
});

const emit = defineEmits(['update:currentPage']);

const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1);
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.totalItems));

const visiblePages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const maxVisible = 5;

  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];

  pages.push(1);

  if (current > 3) {
    pages.push('...');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('...');
  }

  pages.push(total);

  return pages;
});

function goTo(page) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page);
  }
}
</script>
