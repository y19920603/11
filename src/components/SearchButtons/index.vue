<template>
  <button
    v-if="resetBtn"
    type="button"
    class="h-[40px] text-sm flex justify-center items-center px-6 py-3 rounded-[50px] bg-[#262B39] w-full min-w-[76px] cursor-pointer text-nowrap text-[#8480FF] shadow-[0px_-2px_0px_rgba(0,0,0,0.16)]"
    @click="resetSearch"
  >
    {{ $t("BUTTON_RESET") }}
  </button>
  <button
    type="button"
    class="h-[40px] text-sm flex justify-center items-center px-6 py-3 rounded-[50px] bg-gradient-to-b from-[#FF9F6B] to-[#BF4535] w-full shadow-[0px_-2px_0px_rgba(0,0,0,0.16)] cursor-pointer text-nowrap text-white"
    @click="search"
  >
    {{ $t("BUTTON_SEARCH") }}
  </button>
</template>
<script setup lang="ts">
const emits = defineEmits(["reset", "search"]);

defineProps({
  resetBtn: {
    type: Boolean,
    default: () => true,
  },
});

const resetSearch = () => {
  emits("reset");
};

const search = () => {
  emits("search");
};
</script>
