<template>
  <div class="px-8 py-4 pb-1 flex font-bold text-xl">
    {{ typeof route.meta.title === "function" ? route.meta.title() : route.meta.title }}
    <div class="flex-1"></div>
    <slot />
  </div>
  <Breadcrumb />
</template>
<script setup lang="ts">
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
});
const route = useRoute();
</script>
