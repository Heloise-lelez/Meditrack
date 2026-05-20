<script setup>
defineProps({
  title: { type: String, default: null },
  icon: { type: String, default: null },
  variant: { type: String, default: 'contained' },
  color: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
});

defineEmits(['click']);
</script>

<template>
  <button :class="`btn btn--${variant} btn--${color}`" :disabled="disabled" @click="$emit('click')">
    <i v-if="icon" :class="`fa-solid ${icon}`" aria-hidden="true"></i>
    <p v-if="title">{{ title }}</p>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

/* Contained */
.btn--contained.btn--primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}
.btn--contained.btn--primary:hover {
  background-color: var(--color-primary-hover);
}
.btn--contained.btn--primary:active {
  background-color: var(--color-primary-active);
}

.btn--contained.btn--secondary {
  background-color: var(--color-secondary);
  color: var(--color-white);
}
.btn--contained.btn--secondary:hover {
  background-color: var(--color-secondary-hover);
}
.btn--contained.btn--secondary:active {
  background-color: var(--color-secondary-active);
}

/* Outlined */
.btn--outlined.btn--primary {
  background-color: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn--outlined.btn--primary:hover {
  background-color: var(--color-primary-50);
}
.btn--outlined.btn--primary:active {
  background-color: var(--color-primary-100);
}

.btn--outlined.btn--secondary {
  background-color: transparent;
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}
.btn--outlined.btn--secondary:hover {
  background-color: var(--color-secondary-50);
}
.btn--outlined.btn--secondary:active {
  background-color: var(--color-secondary-200);
}

/* Disabled */
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
