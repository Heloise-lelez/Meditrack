<template>
  <main class="not-found" role="main" aria-label="Page introuvable">
    <div class="not-found-content">
      <span class="not-found-icon" aria-hidden="true">🔍</span>
      <h1>Page introuvable</h1>
      <p>Cette section n'existe pas.</p>
      <button class="home-btn" @click="emit('go-home')">Retour à l'accueil</button>
    </div>
  </main>
</template>

<script setup>
const emit = defineEmits(['go-home']);
</script>

<style scoped>
.not-found {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.not-found-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.not-found-icon {
  font-size: 56px;
}

h1 {
  margin: 0;
  font-size: 22px;
  color: #0f2722;
}

p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.home-btn {
  margin-top: 8px;
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.home-btn:hover {
  background: #2f7464;
}
</style>
