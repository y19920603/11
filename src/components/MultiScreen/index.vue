<template>
  <div class="hidden lg:flex justify-center items-center cursor-pointer" @click="toggle">
    <i :class="`w-[24px] h-[24px] block bg-[url('@/assets/icons/MultiScreen.png')]`" />
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from "@/store";

const settingsStore = useSettingsStore();

const toggle = () => {
  settingsStore.changeMultiScreen();
};
</script>
