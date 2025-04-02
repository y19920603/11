<template>
  <div class="px-8 py-4 pb-1 flex font-bold text-xl">
    <div>{{ $t(`PAGE_${title}`) }}</div>
    <div class="flex-1"></div>
    <slot />
  </div>
</template>
<script setup lang="ts">
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
