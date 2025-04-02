<template>
  <div
    class="flex flex-col bg-[url('/src/assets/dashboard/bg.png')] p-8 rounded-xl m-4 items-start items-center md:items-start"
  >
    <div class="flex justify-start items-center w-full flex-col-reverse md:flex-row">
      <div>
        <div class="font-bold text-xl text-center md:text-left" style="word-break: break-all">
          {{ item.total }}
        </div>
        <div class="flex justify-center md:justify-start items-center text-sm mt-3 text-coolgray">
          {{ $t(item.title) }}
          <!-- <i
            class="ml-2 w-4 h-4 block bg-[url('/src/assets/dashboard/ArrowRight.png')] bg-no-repeat bg-center"
          ></i> -->
        </div>
      </div>
      <div class="flex-1"></div>
      <div class="w-[100px] h-[80px]">
        <div
          class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
          :style="{ backgroundImage: `url('/src/assets/dashboard/${item.image}.png')` }"
        ></div>
      </div>
    </div>

    <div class="flex justify-start items-center flex-wrap space-x-2">
      <i :class="iconClass"></i>
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
