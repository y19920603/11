<template>
  <div class="flex justify-center">
    <div class="space-y-1 w-[360px]">
      <div
        class="w-full text-center bg-[#1f212b] text-[#a5abb3] py-2 h-16 flex items-center justify-center flex-col"
      >
        {{ title }}
        <div v-if="current_pool_amount" class="text-amber">${{ current_pool_amount }}</div>
      </div>
      <div v-if="steps.length > 0" class="w-full bg-[#111318] p-4">
        <template v-for="item in steps">
          <div class="p-3 flex justify-center items-center">
            <template v-if="item.cause !== 4">
              <div>
                <img :src="userHeader" width="100%" class="w-[60px] h-auto rounded-1/2" />
                <div
                  v-if="item.is_sb || item.is_bb"
                  class="whitespace-nowrap rounded-full relative bottom-3 text-center w-full border border-[#4cb36a] text-[#4cb36a] bg-[#14312f]"
                >
                  {{ item.is_sb ? "SB" : "BB" }}
                </div>
              </div>
              <div class="flex-1 pl-8">
                <div class="text-gray">{{ item.nickname }}</div>
                <div class="p-2 text-start mx-auto bg-[#ffffff] w-full rounded-md relative">
                  <div
                    class="absolute -left-[14px] top-[0px] w-[15px] h-[31px] border-b-[10px] border-transparent border-b-current rounded-[0px_0px_0px_38px] text-white mr-[40px]"
                  ></div>
                  <div class="fw-bold text-black">{{ item.action }}</div>
                  <div class="fw-bold text-black">${{ item.gold_add.replace("-", " ") }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="w-full flex justify-center items-center">
                <div class="w-[280px] h-[260px] relative b-green z-10">
                  <img class="w-[280px] absolute left-0 top-0 -z-1" :src="settlement" />
                  <div class="p-6 flex">
                    <img :src="userHeader" width="100%" class="w-[60px] h-auto rounded-1/2" />
                    <div class="flex-1"></div>
                    <div>
                      <div class="text-gray relative -left-5">{{ item.nickname }}</div>
                      <div
                        v-if="item.is_sb || item.is_bb"
                        class="whitespace-nowrap rounded-full text-center w-full border border-[#4cb36a] text-[#4cb36a] bg-[#14312f]"
                      >
                        {{ item.is_sb ? "SB" : "BB" }}
                      </div>
                    </div>
                  </div>
                  <span
                    class="absolute top-1/2 left-[35px] -translate-x-1/2 -translate-y-3/5 text-amber text-lg font-bold"
                  >
                    WIN
                  </span>
                  <span
                    class="absolute top-1/2 left-[110px] -translate-x-1/2 -translate-y-3/5 text-amber text-lg font-bold"
                  >
                    {{ item.pot_name }}
                  </span>
                  <span
                    class="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-3/5 text-amber text-lg font-bold"
                  >
                    ${{ item.pot_amount }}
                  </span>
                  <span
                    class="absolute bottom-[60px] left-[50%] -translate-x-1/2 -translate-y-3/5 text-amber text-lg font-bold"
                  >
                    {{ item.max_card_type }}
                  </span>
                  <div
                    class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                    :class="{
                      '-bottom-1': getFilledCardCount(item) === 1,
                      '-bottom-7': getFilledCardCount(item) === 2 || getFilledCardCount(item) === 3,
                    }"
                  >
                    <template v-for="i in [0, 1, 2]">
                      <RoundSeatLogStepCard
                        :card="item[`max_card${i}`]"
                        :count="getFilledCardCount(item)"
                      />
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Step } from "@/api/round_seat_log.api";
import userHeader from "@/assets/images/user-header.png";
import settlement from "@/assets/images/round-game-bg.png";

defineProps({
  steps: {
    type: Array as PropType<Step[]>,
    default: () => [] as Step[],
  },
  title: {
    type: String,
    required: true,
  },
  current_pool_amount: {
    type: String,
  },
});

function getFilledCardCount(item: Step): number {
  return ["max_card0", "max_card1", "max_card2"].filter((key) => {
    const value = item[key as keyof Step];
    return typeof value === "string" && value.trim() !== "";
  }).length;
}
</script>
