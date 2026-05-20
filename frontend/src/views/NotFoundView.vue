<template>
  <NotFoundComponent @go-home="router.push('/')" />
</template>

<script setup>
import { useRouter } from 'vue-router';
import NotFoundComponent from '@/components/not-found/not-found-component.vue';

const router = useRouter();
</script>
