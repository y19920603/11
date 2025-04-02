<template>
  <div
    class="m-4 h-10 bg-gradient-to-r from-[#353E76] to-[#242735] color-white! flex justify-start items-center px-4"
  >
    <div class="flex space-x-10 items-center text-xs">
      <div>{{ $t("TIME_PROGRESS_MONTH") }}：{{ month }}</div>
      <div>{{ $t("TIME_PROGRESS_PASSED_DAYS") }}：{{ passedDays }}</div>
      <div>{{ $t("TIME_PROGRESS_TOTAL_DAYS") }}：{{ totalDays }}</div>
      <div>{{ $t("TIME_PROGRESS_TIME_PASSED") }}：{{ timePassed }}%</div>
      <div>{{ $t("TIME_PROGRESS_UPDATE_TIME") }}：{{ updateTime }}</div>
      <button
        class="bg-gradient-to-b from-[#7E90FF] to-[#604CD6] px-4 py-2 flex justify-center items-center rounded-full cursor-pointer text-xs"
        @click="refresh"
      >
        <el-icon class="is-loading mr-1">
          <RefreshRight />
        </el-icon>
        {{ $t("TIME_PROGRESS_REFRESH") }}
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
const { t } = useI18n();

const currentDate = new Date();

const currentYear = currentDate.getFullYear();
const currentMonth = ref(currentDate.getMonth());

const totalDays = computed(() => {
  return new Date(currentYear, currentMonth.value + 1, 0).getDate();
});

const passedDays = ref(currentDate.getDate());

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const month = computed(() => t(`TIME_PROGRESS_MONTH_${months[currentMonth.value]}`));

const timePassed = computed(() => ((passedDays.value / totalDays.value) * 100).toFixed(2));

const updateTime = ref(currentDate.toLocaleString());

const refresh = () => {
  const newDate = new Date();
  passedDays.value = newDate.getDate();
  updateTime.value = newDate.toLocaleString();
};
</script>
<style scoped>
:deep(.el-button:hover) {
  background-color: none !important;
  border-color: none !important;
  color: var(--el-button-hover-text-color);
  outline: none;
}
</style>
