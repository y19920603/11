<template>
  <div class="flex items-center justify-around sm:flex-col">
    <div class="w-[50px] h-[50px] rounded-full border border-[#343747] border-solid">
      <img class="rounded-full max-w-full h-auto align-middle" :src="gameDetail" />
    </div>
    <div class="flex">
      <template v-for="card in item.card?.split(',')" :key="card">
        <img class="w-8" :src="getPoker(card)" />
      </template>
    </div>
  </div>
  <div class="flex flex-col items-center justify-center w-full sm:flex-1 break-all">
    <div class="flex w-full space-x-2">
      <span class="flex-1 text-right whitespace-nowrap">
        {{ t("ROUND_SEAT_LOG_AGENT_NAME") }} :
      </span>
      <span class="flex-1">{{ item.agent_name }}</span>
    </div>
    <div class="flex w-full space-x-2">
      <span class="flex-1 text-right whitespace-nowrap">{{ t("ROUND_SEAT_LOG_NICKNAME") }} :</span>
      <span class="flex-1">{{ item.nickname }}</span>
    </div>
    <div class="flex w-full space-x-2">
      <span class="flex-1 text-right whitespace-nowrap">
        {{ t("ROUND_SEAT_LOG_ACCOUNT_NUMBER") }} :
      </span>
      <span class="flex-1">{{ item.client_uid }}</span>
    </div>
    <div class="flex w-full space-x-2">
      <span class="flex-1 text-right whitespace-nowrap">{{ t("ROUND_SEAT_LOG_IP") }} :</span>
      <span class="flex-1">{{ item.ip }}</span>
    </div>
    <div class="flex w-full space-x-2">
      <span class="flex-1 text-right whitespace-nowrap">{{ t("ROUND_SEAT_LOG_GOLD_ADD") }} :</span>
      <span class="flex-1">{{ item.gold_add }}</span>
    </div>
  </div>
  <div
    class="border border-[#343747] border-solid rounded-md px-4 py-2 flex justify-center items-center flex-col sm:relative"
  >
    <div v-if="parseFloat(item.gold_add) > 0" class="absolute left-0 top-2 sm:right-0">
      <div class="relative flex justify-center items-center">
        <img :src="win" />
        <span
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 text-amber text-xs"
        >
          WIN
        </span>
      </div>
    </div>
    <span>{{ item.contribution_ratio }}</span>
    <span>{{ t("ROUND_SEAT_LOG_CONTRIBUTION") }}</span>
  </div>
</template>
<script setup lang="ts">
import { Seat } from "@/api/round_seat_log.api";
import gameDetail from "@/assets/images/game_detail.png";
import win from "@/assets/images/win.png";
import { getPoker } from "@/utils/poker";

const { t } = useI18n();

defineProps({
  item: {
    type: Object as PropType<Seat>,
    required: true,
  },
});
</script>
