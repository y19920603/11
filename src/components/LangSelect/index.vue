<template>
  <el-dropdown
    trigger="click"
    @command="handleLanguageChange"
    @visible-change="handleDropdownVisibleChange"
  >
    <div
      class="flex justify-center pl-4 items-center min-w-[156px] h-[40px] bg-[--bg-settings] rounded-full cursor-pointer border border-[#ececec] dark:border-none"
    >
      <div class="space-x-[8px] flex justify-center items-center">
        <i class="w-[16px] h-[16px] block" :style="`background-image: url(${langIcon})`"></i>
        <span>{{ label }}</span>
      </div>
      <div class="flex-1"></div>
      <i
        :class="[
          'w-[16px] h-[16px] block mr-4 transition-transform duration-300 ease-in-out',
          { 'rotate-180': dropdownVisible },
        ]"
        :style="`background-image: url(${arrowIcon})`"
      ></i>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.id"
          :disabled="appStore.language === item.id"
          :command="item.id"
        >
          <img class="w-[20px] mr-1" :src="flagMap[item.id]" />
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import langIcon from "@/assets/icons/Lang.png";
import arrowIcon from "@/assets/icons/Arrow.png";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { useLoadingStore } from "@/store";
import AccountManagementAPI from "@/api/account_management.api";

import deFlag from "@/assets/country/0.jpg";
import enFlag from "@/assets/country/1.jpg";
import esFlag from "@/assets/country/2.jpg";
import itFlag from "@/assets/country/3.jpg";
import jaFlag from "@/assets/country/4.jpg";
import ruFlag from "@/assets/country/5.jpg";
import cnFlag from "@/assets/country/6.jpg";
import twFlag from "@/assets/country/7.jpg";

const flagMap: Record<number, string> = {
  0: deFlag,
  1: enFlag,
  2: esFlag,
  3: itFlag,
  4: jaFlag,
  5: ruFlag,
  6: cnFlag,
  7: twFlag,
};

defineProps({
  size: {
    type: String,
    required: false,
  },
});

const langOptions = ref<EnumVO[]>([] as EnumVO[]);

const appStore = useAppStore();
const { setLoading } = useLoadingStore();
const { locale } = useI18n();
const dropdownVisible = ref(false);

const label = computed(() => langOptions.value.find((e) => e.id.toString() === locale.value)?.name);

const handleLanguageChange = (lang: number) => {
  AccountManagementAPI.lang({ lang })
    .then(({ result, msg }) => {
      if (!result) {
        console.error("Error changing language:", msg);
        return;
      }
      locale.value = lang.toString();
      appStore.changeLanguage(lang);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error changing language:", error);
    });
};

const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible;
};

const getInitialData = async () => {
  setLoading(true);
  try {
    const [langs] = await Promise.all([EnumAPI.get("Language")]);
    langOptions.value = langs;
  } catch {
    console.error("Failed to fetch language options.");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  getInitialData();
});
</script>
