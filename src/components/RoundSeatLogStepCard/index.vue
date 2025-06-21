<template>
  <div class="flex space-x-1">
    <template v-for="(card, index) in card.split(',')" :key="card">
      <img
        class="relative"
        :class="count === 1 ? 'w-8' : count === 2 ? 'w-6' : 'w-4'"
        :src="getPoker(card)"
        :style="getWaveStyle(index)"
      />
    </template>
  </div>
</template>
<script setup lang="ts">
import { getPoker } from "@/utils/poker";

const props = defineProps({
  card: {
    type: String,
    default: () => "",
  },
  count: {
    type: Number,
    default: () => 1,
  },
});

const getWaveStyle = (index: number) => {
  if (props.count > 1) {
    return "";
  }
  const waveMap = [-12, -6, 0, -6, -12];
  return {
    transform: `translateY(${waveMap[index] || 0}px)`,
  };
};
</script>
