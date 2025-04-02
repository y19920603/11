<template>
  <div class="flex justify-end items-center space-x-2">
    <div>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        start-placeholder="Start Date"
        end-placeholder="End Date"
        :clearable="false"
        style="width: 220px"
      />
    </div>

    <div class="flex items-center space-x-2">
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
    </div>

    <div class="space-x-2">
      <button
        type="button"
        class="cursor-pointer px-4 py-2 rounded-full bg-[#242735]"
        :class="{ 'bg-[#8480FF]': filterBtn == DateTimeFilterEnum.TODAY }"
        @click="selectToday"
      >
        {{ $t("DATE_TIME_FILTER_TODAY") }}
      </button>
      <button
        type="button"
        class="cursor-pointer px-4 py-2 rounded-full bg-[#242735]"
        :class="{ 'bg-[#8480FF]': filterBtn == DateTimeFilterEnum.WEEK }"
        @click="selectThisWeek"
      >
        {{ $t("DATE_TIME_FILTER_WEEK") }}
      </button>
      <button
        type="button"
        class="cursor-pointer px-4 py-2 rounded-full bg-[#242735]"
        :class="{ 'bg-[#8480FF]': filterBtn == DateTimeFilterEnum.MONTH }"
        @click="selectThisMonth"
      >
        {{ $t("DATE_TIME_FILTER_MONTH") }}
      </button>
    </div>

    <div>
      <button
        type="button"
        class="cursor-pointer px-7 py-2 rounded-full bg-gradient-to-b from-[#FF9F6B] to-[#BF4535]"
        @click="search"
      >
        {{ $t("DATE_TIME_FILTER_SEARCH") }}
      </button>
    </div>
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
});

const emit = defineEmits(["updateStartDateTime", "updateEndDateTime", "search"]);

const dateRange = ref([
  dayjs(props.startDateTime).format("YYYY-MM-DD"),
  dayjs(props.endDateTime).format("YYYY-MM-DD"),
]);
const startTime = ref("00:00");
const endTime = ref("23:59");

const filterBtn = ref(DateTimeFilterEnum.TODAY);

const resetTime = () => {
  startTime.value = "00:00";
  endTime.value = "23:59";
};

const selectToday = () => {
  dateRange.value = [dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")];
  filterBtn.value = DateTimeFilterEnum.TODAY;
  resetTime();
};

const selectThisWeek = () => {
  const startOfWeek = dayjs().startOf("week").format("YYYY-MM-DD");
  const endOfWeek = dayjs().endOf("week").format("YYYY-MM-DD");
  dateRange.value = [startOfWeek, endOfWeek];
  filterBtn.value = DateTimeFilterEnum.WEEK;
  resetTime();
};

const selectThisMonth = () => {
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
  filterBtn.value = DateTimeFilterEnum.MONTH;
  dateRange.value = [startOfMonth, endOfMonth];
};

// Watch for changes in the date and time values
watch([dateRange, startTime, endTime], () => {
  const newStartDateTime = dayjs(`${dateRange.value[0]} ${startTime.value}:00`).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  const newEndDateTime = dayjs(`${dateRange.value[1]} ${endTime.value}:59`).format(
    "YYYY-MM-DD HH:mm:ss"
  );

  emit("updateStartDateTime", newStartDateTime);
  emit("updateEndDateTime", newEndDateTime);
});

const search = () => {
  emit("search");
};
</script>
