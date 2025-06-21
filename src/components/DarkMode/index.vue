<template>
  <div
    class="flex dark:bg-[#1b1d29] rounded-full justify-between w-[72px] items-center px-1 py-1 cursor-pointer border border-[#ececec] dark:border-none"
  >
    <div
      :class="[
        'rounded-full w-[32px] h-[32px] flex justify-center items-center transition-all',
        settingsStore.theme === ThemeMode.DARK ? 'bg-[#2f3343]' : '',
      ]"
      @click="toggleTheme(ThemeMode.DARK)"
    >
      <img :src="dark" alt="Dark mode icon" />
    </div>
    <div
      :class="[
        'rounded-full w-[32px] h-[32px] flex justify-center items-center transition-all',
        settingsStore.theme === ThemeMode.LIGHT ? 'bg-[#d4dcff]' : '',
      ]"
      @click="toggleTheme(ThemeMode.LIGHT)"
    >
      <img :src="light" alt="Light mode icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import dark from "@/assets/images/dark.png";
import light from "@/assets/images/light.png";
import { useSettingsStore } from "@/store";
import { ThemeMode } from "@/enums/settings/theme.enum";

const settingsStore = useSettingsStore();
const isDark = ref<boolean | string>(settingsStore.theme === ThemeMode.DARK);
const toggleTheme = (value: string) => {
  isDark.value = value;
};

watch(isDark, (val) => {
  settingsStore.changeTheme(val as string);
});
</script>
