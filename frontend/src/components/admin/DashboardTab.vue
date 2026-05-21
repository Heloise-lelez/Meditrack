<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { api } from '@/lib/api.js';
import CustomTable from '@/components/shared/CustomTable.vue';

const period = ref(7);
const loading = ref(false);
const error = ref(null);
const stats = ref(null);
const logs = ref([]);
const logsLoading = ref(false);

const LOG_COLUMNS = [
  { key: 'created_at', label: 'Date', render: (r) => formatDate(r.created_at) },
  { key: 'actor_email', label: 'Acteur' },
  { key: 'actor_role', label: 'Rôle' },
  { key: 'route', label: 'Route' },
  { key: 'status', label: 'Status', render: (r) => r.status ?? '—' },
  {
    key: 'duration_ms',
    label: 'Durée (ms)',
    render: (r) => (r.duration_ms != null ? r.duration_ms : '—'),
  },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadStats() {
  loading.value = true;
  error.value = null;
  try {
    stats.value = await api.get(`/api/admin/dashboard-stats?days=${period.value}`);
  } catch (err) {
    error.value = err.message || 'Erreur lors du chargement des statistiques.';
  } finally {
    loading.value = false;
  }
}

async function loadLogs() {
  logsLoading.value = true;
  try {
    logs.value = await api.get('/api/admin/audit-logs?limit=50');
  } catch {
    // silently fail — table shows empty
  } finally {
    logsLoading.value = false;
  }
}

watch(period, loadStats);
onMounted(() => {
  loadStats();
  loadLogs();
});

const barDayMax = computed(() => {
  if (!stats.value?.by_day?.length) return 1;
  return Math.max(...stats.value.by_day.map((d) => d.total), 1);
});

const routeMax = computed(() => {
  if (!stats.value?.top_routes?.length) return 1;
  return stats.value.top_routes[0]?.count || 1;
});

const roleTotal = computed(() => {
  if (!stats.value?.by_role?.length) return 1;
  return Math.max(
    stats.value.by_role.reduce((s, r) => s + r.count, 0),
    1
  );
});

function dayLabel(dateStr) {
  const [, , dd] = dateStr.split('-');
  return dd;
}
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard activité</h1>
      <div class="period-toggle">
        <button :class="['period-btn', { active: period === 7 }]" @click="period = 7">
          7 jours
        </button>
        <button :class="['period-btn', { active: period === 30 }]" @click="period = 30">
          30 jours
        </button>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="dash-error">{{ error }}</p>

    <!-- Loading -->
    <div v-if="loading" class="dash-loading">
      <div class="spinner"></div>
    </div>

    <template v-else-if="stats">
      <!-- KPI cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-icon"><i class="fa-solid fa-arrow-right-arrow-left"></i></span>
          <span class="kpi-value">{{ stats.total.toLocaleString('fr-FR') }}</span>
          <span class="kpi-label">Requêtes</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon kpi-success"><i class="fa-solid fa-circle-check"></i></span>
          <span class="kpi-value">{{ stats.success_rate }}&thinsp;%</span>
          <span class="kpi-label">Taux de succès</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon"><i class="fa-solid fa-stopwatch"></i></span>
          <span class="kpi-value">{{ stats.avg_duration_ms }}&thinsp;ms</span>
          <span class="kpi-label">Temps moyen</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon"><i class="fa-solid fa-users"></i></span>
          <span class="kpi-value">{{ stats.active_users }}</span>
          <span class="kpi-label">Utilisateurs actifs</span>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <!-- Activity by day -->
        <div class="chart-card">
          <h2 class="chart-title">Activité par jour</h2>
          <div v-if="stats.by_day.length" class="bar-chart-vertical">
            <div
              v-for="day in stats.by_day"
              :key="day.date"
              class="bar-col"
              :title="`${day.date} — ${day.total} requêtes, ${day.errors} erreurs`"
            >
              <div class="bar-stack">
                <div
                  class="bar-segment bar-error"
                  :style="{ height: `${(day.errors / barDayMax) * 100}%` }"
                ></div>
                <div
                  class="bar-segment bar-success"
                  :style="{ height: `${((day.total - day.errors) / barDayMax) * 100}%` }"
                ></div>
              </div>
              <span class="bar-day-label">{{ dayLabel(day.date) }}</span>
            </div>
          </div>
          <p v-else class="chart-empty">Aucune donnée sur la période.</p>
          <div class="chart-legend">
            <span class="legend-dot legend-success"></span> Succès
            <span class="legend-dot legend-error"></span> Erreurs
          </div>
        </div>

        <!-- By role -->
        <div class="chart-card">
          <h2 class="chart-title">Répartition par rôle</h2>
          <div v-if="stats.by_role.length" class="hbar-list">
            <div v-for="item in stats.by_role" :key="item.role" class="hbar-row">
              <span class="hbar-label">{{ item.role }}</span>
              <div class="hbar-track">
                <div
                  class="hbar-fill"
                  :style="{ width: `${(item.count / roleTotal) * 100}%` }"
                ></div>
              </div>
              <span class="hbar-count">{{ item.count }}</span>
            </div>
          </div>
          <p v-else class="chart-empty">Aucune donnée.</p>
        </div>
      </div>

      <!-- Top routes -->
      <div class="chart-card">
        <h2 class="chart-title">Top routes</h2>
        <div v-if="stats.top_routes.length" class="hbar-list">
          <div v-for="item in stats.top_routes" :key="item.route" class="hbar-row">
            <span class="hbar-label hbar-label--mono">{{ item.route }}</span>
            <div class="hbar-track">
              <div
                class="hbar-fill hbar-fill--alt"
                :style="{ width: `${(item.count / routeMax) * 100}%` }"
              ></div>
            </div>
            <span class="hbar-count">{{ item.count }}</span>
          </div>
        </div>
        <p v-else class="chart-empty">Aucune donnée.</p>
      </div>
    </template>

    <!-- Recent logs table -->
    <div class="section-card">
      <h2 class="chart-title">Logs récents</h2>
      <CustomTable
        :columns="LOG_COLUMNS"
        :rows="logs"
        row-key="id"
        :loading="logsLoading"
        empty-message="Aucun log disponible."
      >
        <template #status="{ row }">
          <span :class="['status-badge', row.status >= 400 ? 'status-error' : 'status-ok']">
            {{ row.status ?? '—' }}
          </span>
        </template>
      </CustomTable>
    </div>
  </div>
</template>

<style scoped>
@import './AdminList.css';

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.dashboard-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-black);
  margin: 0;
}

.period-toggle {
  display: flex;
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.period-btn {
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  background: var(--color-white);
  color: var(--color-gray);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.period-btn:first-child {
  border-right: 1px solid var(--color-gray-light);
}

.period-btn.active {
  background: var(--color-primary);
  color: var(--color-white);
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-md);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.kpi-icon {
  font-size: 20px;
  color: var(--color-primary);
}

.kpi-icon.kpi-success {
  color: #16a34a;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-black);
  line-height: 1;
}

.kpi-label {
  font-size: 0.8rem;
  color: var(--color-gray);
  font-weight: 500;
}

/* Charts row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card,
.section-card {
  background: var(--color-white);
  border: 1px solid var(--color-gray-light);
  border-radius: var(--radius-md);
  padding: 20px;
}

.chart-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-black);
  margin: 0 0 16px;
}

.chart-empty {
  font-size: 0.85rem;
  color: var(--color-gray);
  margin: 0;
}

/* Vertical bar chart */
.bar-chart-vertical {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
  overflow-x: auto;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 20px;
  height: 100%;
}

.bar-stack {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  max-width: 32px;
}

.bar-segment {
  width: 100%;
  transition: height 0.3s ease;
  min-height: 0;
}

.bar-success {
  background: var(--color-primary);
  border-radius: 2px 2px 0 0;
}

.bar-error {
  background: var(--color-error, #ef4444);
}

.bar-day-label {
  font-size: 0.7rem;
  color: var(--color-gray);
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: var(--color-gray);
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
}

.legend-success {
  background: var(--color-primary);
}
.legend-error {
  background: var(--color-error, #ef4444);
}

/* Horizontal bars */
.hbar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hbar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hbar-label {
  font-size: 0.8rem;
  color: var(--color-gray-dark);
  width: 120px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hbar-label--mono {
  width: 200px;
  font-family: monospace;
  font-size: 0.75rem;
}

.hbar-track {
  flex: 1;
  height: 8px;
  background: var(--color-gray-light);
  border-radius: 4px;
  overflow: hidden;
}

.hbar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.4s ease;
}

.hbar-fill--alt {
  background: var(--color-primary-hover, #0b6e5c);
}

.hbar-count {
  font-size: 0.8rem;
  color: var(--color-gray);
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
}

.status-ok {
  background: #dcfce7;
  color: #166534;
}
.status-error {
  background: #fee2e2;
  color: #991b1b;
}

/* Loading / error */
.dash-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.dash-error {
  color: var(--color-error);
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .hbar-label--mono {
    width: 140px;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .hbar-label--mono {
    width: 110px;
  }
}
</style>
