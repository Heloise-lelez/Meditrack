<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({ notifications: { type: Array, default: () => [] } });
const emit = defineEmits(['dismiss']);

const timers = new Map();

function scheduleAutoDismiss(notification) {
  if (timers.has(notification.id)) return;
  const t = setTimeout(() => {
    emit('dismiss', notification.id);
    timers.delete(notification.id);
  }, 10000);
  timers.set(notification.id, t);
}

watch(
  () => props.notifications,
  (list) => {
    for (const n of list) scheduleAutoDismiss(n);
  },
  { immediate: true, deep: true }
);

onUnmounted(() => {
  for (const t of timers.values()) clearTimeout(t);
});

function relativeTime(iso) {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin === 1) return 'Il y a 1 min';
  return `Il y a ${diffMin} min`;
}
</script>

<template>
  <div v-if="notifications.length" class="toast-container" role="alert" aria-live="polite">
    <div v-for="n in notifications" :key="n.id" class="toast-card">
      <div class="toast-header">
        <span class="toast-doctor">{{ n.doctorName }}</span>
        <button
          class="toast-dismiss"
          @click="$emit('dismiss', n.id)"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      </div>
      <p class="toast-message">{{ n.message }}</p>
      <div class="toast-footer">
        <span class="toast-patient">Patient : {{ n.patientName }}</span>
        <span class="toast-time">{{ relativeTime(n.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 340px;
  width: calc(100vw - 32px);
}

.toast-card {
  background: var(--color-white, #fff);
  border-left: 4px solid var(--color-primary, #8c3a78);
  border-radius: 8px;
  padding: 14px 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
}

.toast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.toast-doctor {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-primary-dark, #2e7160);
}

.toast-dismiss {
  background: none;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-gray-dark, #555);
  padding: 0 2px;
}

.toast-dismiss:hover {
  color: var(--color-danger, #c0392b);
}

.toast-message {
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--color-gray-dark, #333);
  line-height: 1.4;
}

.toast-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-gray-dark, #777);
  opacity: 0.75;
}

@media (max-width: 768px) {
  .toast-container {
    top: 8px;
    right: 8px;
    left: 8px;
    width: auto;
    max-width: none;
  }
}
</style>
