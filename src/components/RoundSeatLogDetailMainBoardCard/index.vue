<template>
  <div class="flex space-x-1">
    <template v-for="card in item.split(',')" :key="card">
      <img class="w-8" :src="getPoker(card)" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { getPoker } from "@/utils/poker";

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  item: {
    type: String,
    default: "",
  },
});
</script>
