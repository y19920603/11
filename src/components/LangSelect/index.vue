<template>
  <el-dropdown
    trigger="click"
    @command="handleLanguageChange"
    @visible-change="handleDropdownVisibleChange"
  >
    <div class="flex justify-center pl-4 items-center w-[156px] h-[40px] bg-[#2E3343] rounded-full">
      <div class="space-x-[8px] flex justify-center items-center">
        <i class="w-[16px] h-[16px] block bg-[url('@/assets/icons/Lang.png')]"></i>
        <span>{{ label }}</span>
      </div>
      <div class="flex-1"></div>
      <i
        :class="[
          'w-[16px] h-[16px] block bg-[url(src/assets/icons/Arrow.png)] mr-4 transition-transform duration-300 ease-in-out',
          { 'rotate-180': dropdownVisible },
        ]"
      ></i>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="appStore.language === item.value"
          :command="item.value"
        >
          <img class="w-[20px] mr-1" :src="`/src/assets/country/${item.value}.jpg`" />
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/modules/app.store";
import { LanguageEnum } from "@/enums/settings/locale.enum";

defineProps({
  size: {
    type: String,
    required: false,
  },
});

const langOptions = [
  { label: "English", value: LanguageEnum.EN },
  { label: "繁體中文", value: LanguageEnum.ZH_TW },
  { label: "简体中文", value: LanguageEnum.ZH_CN },
];

const appStore = useAppStore();
const { locale } = useI18n();
const dropdownVisible = ref(false);

const label = computed(() => langOptions.find((e) => e.value === locale.value)?.label);

const handleLanguageChange = (lang: string) => {
  locale.value = lang;
  appStore.changeLanguage(lang);
};

const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible;
};
</script>
