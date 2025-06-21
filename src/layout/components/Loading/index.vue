<template>
  <div v-show="loadingStore.loading" class="absolute inset-0 flex items-center justify-center z-50">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
  </div>
</template>
<script setup lang="ts">
import { useLoadingStore } from "@/store";

const loadingStore = useLoadingStore();
</script>
