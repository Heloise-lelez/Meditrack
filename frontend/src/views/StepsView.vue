<script setup lang="ts">
import Steps from "@/components/etapes/etapes-component.vue";
import { useAuth } from "@/composables/useAuth";
const { userRole } = useAuth();
</script>
<template>
  {{ userRole }}
  <Steps />
</template>
<style scoped></style>
