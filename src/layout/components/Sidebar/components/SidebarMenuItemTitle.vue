<template>
  <!-- 菜单图标 -->
  <i
    class="w-4 h-4 block bg-no-repeat ml-5"
    :style="{ 'background-image': `url('/src/assets/menus/${props.icon}.png')` }"
  ></i>
  <!-- 菜单标题 -->
  <span v-if="props.title" class="ml-2">{{ props.title }}</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon?: string;
  title?: string;
}>();
</script>
