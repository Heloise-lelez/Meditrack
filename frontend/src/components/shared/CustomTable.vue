<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: 'id' },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'Aucun résultat trouvé.' },
});
</script>

<template>
  <div class="table-wrapper">
    <div v-if="loading" class="table-loading" role="status">
      <div class="spinner" aria-hidden="true"></div>
    </div>

    <template v-else>
      <table class="dynamic-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" scope="col">{{ col.label }}</th>
            <th v-if="$slots.actions" scope="col"></th>
          </tr>
        </thead>
        <tbody>
          <template v-if="rows.length">
            <tr v-for="row in rows" :key="row[rowKey]">
              <td v-for="col in columns" :key="col.key">
                <slot :name="col.key" :row="row">
                  {{ col.render ? col.render(row) : (row[col.key] ?? '—') }}
                </slot>
              </td>
              <td v-if="$slots.actions" class="td-actions">
                <slot name="actions" :row="row" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-show="rows.length === 0" class="no-result">{{ emptyMessage }}</p>
    </template>
  </div>
</template>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.dynamic-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.dynamic-table th,
.dynamic-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid var(--color-gray-light);
}

.dynamic-table th {
  height: 40px;
  font-weight: 600;
  color: var(--color-primary-dark);
  background-color: var(--color-primary-background);
}

.dynamic-table tbody tr:hover {
  background-color: var(--color-primary-background);
}

.dynamic-table tr:last-child td {
  border-bottom: none;
}

.td-actions {
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .dynamic-table th,
  .dynamic-table td {
    min-width: 200px;
  }
}
</style>
