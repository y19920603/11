<template>
  <div
    class="flex justify-end items-center md:space-x-2 md:space-y-0 space-y-4 flex-col md:flex-row"
  >
    <div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="Start Date"
        end-placeholder="End Date"
        :clearable="false"
        format="YYYY-MM-DD"
        unlink-panels
        @change="async () => await handleDateChange()"
      />
    </div>

    <!-- <div class="flex items-center space-x-2">
      <span>{{ $t("DATE_TIME_FILTER_START_TIME") }}</span>
      <el-time-select
        v-model="startTime"
        :max-time="endTime"
        start="00:00"
        step="00:01"
        end="23:59"
        style="width: 110px"
        :clearable="false"
      />
      <span>{{ $t("DATE_TIME_FILTER_END_TIME") }}</span>
      <el-time-select
        v-model="endTime"
        :min-time="startTime"
        start="00:00"
        step="00:01"
        end="23:59"
        style="width: 110px"
        :clearable="false"
      />
    </div> -->

    <div v-show="dateMode !== null" class="space-x-2 w-full flex">
      <button
        type="button"
        class="cursor-pointer h-[40px] px-6 py-3 rounded-full bg-[--el-bg-color] w-1/3 border border-[#ececec] dark:border-none"
        :class="{ 'bg-[#8480FF] text-white': filterBtn == DateTimeFilterEnum.TODAY }"
        @click="selectToday"
      >
        {{ $t("DATE_TIME_FILTER_TODAY") }}
      </button>
      <button
        type="button"
        class="cursor-pointer h-[40px] px-6 py-3 rounded-full bg-[--el-bg-color] w-1/3 border border-[#ececec] dark:border-none"
        :class="{ 'bg-[#8480FF] text-white': filterBtn == DateTimeFilterEnum.WEEK }"
        @click="selectThisWeek"
      >
        {{ $t("DATE_TIME_FILTER_WEEK") }}
      </button>
      <button
        type="button"
        class="cursor-pointer h-[40px] px-6 py-3 rounded-full bg-[--el-bg-color] w-1/3 border border-[#ececec] dark:border-none"
        :class="{ 'bg-[#8480FF] text-white': filterBtn == DateTimeFilterEnum.MONTH }"
        @click="selectThisMonth"
      >
        {{ $t("DATE_TIME_FILTER_MONTH") }}
      </button>
    </div>

    <!-- <div>
      <button
        type="button"
        class="cursor-pointer px-7 py-2 rounded-full bg-gradient-to-b from-[#FF9F6B] to-[#BF4535]"
        @click="search"
      >
        {{ $t("DATE_TIME_FILTER_SEARCH") }}
      </button>
    </div> -->
  </div>
</template>

<script setup>
import { ref } from "vue";
import { DateTimeFilterEnum } from "@/enums";
import dayjs from "dayjs";

const props = defineProps({
  startDateTime: {
    type: String,
    required: true,
  },
  endDateTime: {
    type: String,
    required: true,
  },
  dateMode: {
    type: String,
    default: () => null,
  },
});

const emit = defineEmits(["updateDateTime"]);

const dateRange = ref([
  dayjs(props.startDateTime).format("YYYY-MM-DD"),
  dayjs(props.endDateTime).format("YYYY-MM-DD"),
]);

watch(
  () => [props.startDateTime, props.endDateTime],
  ([newStart, newEnd]) => {
    dateRange.value = [dayjs(newStart).format("YYYY-MM-DD"), dayjs(newEnd).format("YYYY-MM-DD")];
  },
  { immediate: true }
);
// const startTime = ref("00:00");
// const endTime = ref("23:59");

const filterBtn = ref(props.dateMode);
watch(
  () => props.dateMode,
  (newValue) => {
    filterBtn.value = newValue;
  },
  { immediate: true }
);

// const resetTime = () => {
//   startTime.value = "00:00";
//   endTime.value = "23:59";
// };

const selectToday = () => {
  if (filterBtn.value == DateTimeFilterEnum.TODAY) return;

  const today = dayjs().format("YYYY-MM-DD");
  dateRange.value = [
    dayjs(`${today} 00:00:00`).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(`${today} 23:59:59`).format("YYYY-MM-DD HH:mm:ss"),
  ];
  filterBtn.value = DateTimeFilterEnum.TODAY;
  emitTime();
};

const selectThisWeek = () => {
  if (filterBtn.value == DateTimeFilterEnum.WEEK) return;

  const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
  const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");
  dateRange.value = [
    dayjs(`${startOfWeek} 00:00:00`).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(`${endOfWeek} 23:59:59`).format("YYYY-MM-DD HH:mm:ss"),
  ];
  filterBtn.value = DateTimeFilterEnum.WEEK;
  emitTime();
};

const selectThisMonth = () => {
  if (filterBtn.value == DateTimeFilterEnum.MONTH) return;

  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
  dateRange.value = [
    dayjs(`${startOfMonth} 00:00:00`).format("YYYY-MM-DD HH:mm:ss"),
    dayjs(`${endOfMonth} 23:59:59`).format("YYYY-MM-DD HH:mm:ss"),
  ];
  filterBtn.value = DateTimeFilterEnum.MONTH;
  emitTime();
};

const handleDateChange = () => {
  filterBtn.value = "";
  emitTime();
};

const emitTime = () => {
  emit("updateDateTime", {
    start_datetime: dayjs(dateRange.value[0]).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    end_datetime: dayjs(dateRange.value[1]).endOf("day").format("YYYY-MM-DD HH:mm:ss"),
    date_mode: filterBtn.value,
  });
};

// const search = () => {
//   emit("search");
// };
</script>
