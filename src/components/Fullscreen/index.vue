<template>
  <div class="flex justify-center items-center" @click="toggle">
    <template v-if="isFullscreen">
      <i :class="`w-[24px] h-[24px] block bg-[url('@/assets/icons/Shrink.png')]`" />
    </template>
    <template v-else>
      <i :class="`w-[24px] h-[24px] block bg-[url('@/assets/icons/FullScreen.png')]`" />
    </template>
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>
