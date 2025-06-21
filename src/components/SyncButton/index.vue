<template>
  <div class="flex flex-1 2xl:flex-initial">
    <button
      class="h-[40px] text-sm flex justify-center items-center px-6 py-3 rounded-full bg-[#f46a6a] cursor-pointer whitespace-nowrap text-white flex-1 2xl:w-max relative"
      @click="asyncData"
    >
      {{ t("BUTTON_SYNC") }}
      <span
        class="text-xs 2xl:whitespace-nowrap break-all absolute -bottom-4 left-3"
        :class="{ 'text-green': async, 'text-red': !async }"
      >
        {{ asyncMsg }}
      </span>
    </button>
  </div>
</template>
<script setup lang="ts">
const emits = defineEmits(["async"]);

const { t } = useI18n();

defineProps({
  async: {
    type: Boolean,
    default: () => false,
  },
  asyncMsg: {
    type: String,
    default: () => "",
  },
});

const asyncData = () => {
  emits("async");
};
</script>
