<template>
  <section
    class="container-section"
    role="region"
    :aria-labelledby="title ? 'section-card-title' : undefined"
  >
    <div class="container">
      <h1 v-if="title" id="section-card-title" tabindex="0">{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.container h1 {
  font-size: 24px;
  margin-bottom: 12px;
}

.container p {
  color: #6b7280;
}
</style>
