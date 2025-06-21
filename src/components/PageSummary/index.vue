<template>
  <div
    class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 3xl:my-6"
  >
    <template v-for="(item, index) of items" :key="index">
      <div
        class="flex py-4 px-8 rounded-xl m-4 flex-col justify-center"
        :style="{
          backgroundImage: settingsStore.theme === ThemeMode.DARK ? `url(${bgImage})` : ``,
        }"
        :class="{
          'border-2 rounded-lg border-[#eee] shadow-md': settingsStore.theme === ThemeMode.LIGHT,
        }"
      >
        <div class="flex justify-center items-center flex-col-reverse md:flex-row">
          <div
            class="flex flex-col justify-center items-center mt-2 md:items-start text-[#ADB5BD] text-base"
          >
            <div>{{ $t(item.title) }}</div>
            <div class="">{{ item.value }}</div>
            <div v-if="labelText">
              <span>{{ $t(`AGENT_PROFIT_${labelText}`) }}</span>
              {{ item.previous }}
            </div>
          </div>
          <div class="flex-1"></div>
          <div class="w-[100px] h-[80px]" :class="{ 'hidden md:block': !item.imageSrc }">
            <div
              class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
              :style="{ backgroundImage: `url('${getSummaryImg(item.imageSrc)}')` }"
            ></div>
          </div>
        </div>
        <div
          v-if="labelText"
          class="flex space-x-2 justify-center md:justify-start"
          :class="{
            'text-[#34c38f]': item.trend === 0,
            'text-[#f46a6a]': item.trend === 1,
            'text-[#f1b44c]': item.trend === 2,
          }"
        >
          <i
            v-if="item.trend !== 2"
            class="mdi"
            :class="{
              'mdi-arrow-up-bold': item.trend === 0,
              'mdi-arrow-down-bold': item.trend === 1,
            }"
          ></i>
          <div>{{ item.increase }}</div>
          <div class="text-[#ADB5BD]">{{ $t(`AGENT_PROFIT_SINCE_${labelText}`) }}</div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { SummaryItemVO } from "@/api/types/summary";
import bgImage from "@/assets/dashboards/bg.png";
import getSummaryImg from "@/utils/summaryImg";

import { useSettingsStore } from "@/store";
import { ThemeMode } from "@/enums/settings/theme.enum";

const settingsStore = useSettingsStore();

const props = defineProps({
  items: {
    type: Array as PropType<SummaryItemVO[]>,
    required: true,
  },
  date_mode: {
    type: String,
    default: () => "",
  },
});

const labelText = computed(() => {
  switch (props.date_mode) {
    case "D":
      return "YESTERDAY";
    case "W":
      return "LAST_WEEK";
    case "M":
      return "LAST_MONTH";
    default:
      return "";
  }
});
</script>
