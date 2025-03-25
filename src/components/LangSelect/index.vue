<template>
  <el-dropdown trigger="click" @command="handleLanguageChange">
    <div class="i-svg:language" />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in langOptions"
          :key="item.value"
          :disabled="appStore.language === item.value"
          :command="item.value"
        >
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

function handleLanguageChange(lang: string) {
  locale.value = lang;
  appStore.changeLanguage(lang);
}
</script>
