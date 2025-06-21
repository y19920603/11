<template>
  <div
    class="flex flex-col p-8 rounded-xl m-4 items-start items-center md:items-start"
    :style="{ backgroundImage: settingsStore.theme === ThemeMode.DARK ? `url(${bgImage})` : `` }"
    :class="{
      'border-2 rounded-lg border-[#eee] shadow-md': settingsStore.theme === ThemeMode.LIGHT,
    }"
  >
    <div class="flex justify-start items-center w-full flex-col-reverse md:flex-row">
      <div>
        <div class="font-bold text-xl text-center md:text-left" style="word-break: break-all">
          {{ item.total }}
        </div>
        <div class="flex justify-center md:justify-start items-center text-sm mt-3 text-coolgray">
          {{ $t(item.title) }}
        </div>
      </div>
      <div class="flex-1"></div>
      <div class="w-[100px] h-[80px]">
        <div
          class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
          :style="{ backgroundImage: `url(${getImg(item.image)})` }"
        ></div>
      </div>
    </div>

    <div class="flex justify-start items-center flex-wrap space-x-2">
      <i v-if="iconClass" :class="iconClass"></i>
      <div :class="trendClass" class="font-bold">
        {{ item.growth }}
      </div>
      <template v-if="item.trend !== '' && item.trend !== undefined && item.trend !== 3">
        <p class="text-coolgray">{{ $t("DASHBOARD_SINCE_LAST_WEEK") }}</p>
      </template>
      <template v-else-if="item.trend === 3">
        <p class="text-coolgray">{{ $t("DASHBOARD_HIGHEST_GAME_PLAYERS") }}</p>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { DashBoardCard } from "@/api/dashboard.api";
import bgImage from "@/assets/dashboards/bg.png";
import { useSettingsStore } from "@/store";
import { ThemeMode } from "@/enums/settings/theme.enum";

const images = import.meta.glob("@/assets/dashboards/*.png", { eager: true });
const settingsStore = useSettingsStore();
const getImg = (imageName: string) => {
  const imgModule = images[`/src/assets/dashboards/${imageName}.png`];

  return imgModule ? (imgModule as { default: string }).default : "";
};

const props = defineProps({
  item: {
    type: Object as PropType<DashBoardCard>,
    required: true,
  },
});

const trendClass = computed(() => {
  switch (props.item.trend) {
    case 0:
      return "text-[#34c38f]";
    case 1:
      return "text-[#f46a6a]";
    case 3:
      return "";
    default:
      return "text-[#f1b44c]";
  }
});

const iconClass = computed(() => {
  switch (props.item.trend) {
    case 0:
      return "mdi mdi-arrow-up-bold text-[#34c38f]";
    case 1:
      return "mdi mdi-arrow-down-bold text-[#f46a6a]";
    case "":
    case 3:
    case 2:
      return "";
    default:
      return "mdi mdi-minus text-[#f1b44c]";
  }
});
</script>
