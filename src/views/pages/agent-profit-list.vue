<template>
  <PageTitle title="AGENT_PROFIT"></PageTitle>
  <div class="py-4 px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <template v-for="(item, index) of summaryAry" :key="index">
        <div class="flex bg-[url('/src/assets/dashboard/bg.png')] p-8 rounded-xl m-4 flex-col">
          <div class="flex justify-center items-center flex-col-reverse md:flex-row">
            <div
              class="flex flex-col justify-center items-center mt-2 md:items-start text-[#ADB5BD] text-base"
            >
              <div>{{ $t(`AGENT_PROFIT_${item.title}`) }}</div>
              <div class="">${{ item.value }}</div>
              <div class="">
                <span v-if="labelText">{{ $t(`AGENT_PROFIT_${labelText}`) }}</span>
                ${{ item.previous }}
              </div>
            </div>
            <div class="flex-1"></div>
            <div class="w-[100px] h-[80px]">
              <div
                class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
                :style="{ backgroundImage: `url('/src/assets/agent/${item.imageSrc}.png')` }"
              ></div>
            </div>
          </div>
          <div
            class="flex space-x-2 justify-center md:justify-start"
            :class="{
              'text-[#34c38f]': item.trend === 0,
              'text-[#f46a6a]': item.trend === 1,
              'text-[#f1b44c]': item.trend === 2,
            }"
          >
            <i
              class="mdi"
              :class="{
                'mdi-arrow-up-bold': item.trend === 0,
                'mdi-arrow-down-bold': item.trend === 1,
                'mdi-minus': item.trend === 2,
              }"
            ></i>
            <div>{{ item.increase }}</div>
            <div class="text-[#ADB5BD]">{{ $t(`AGENT_PROFIT_SINCE_${labelText}`) }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div class="p-8">
    <DataTable />
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";

import AgentProfitAPI, {
  AgentProfitPageQuery,
  AgentProfitVO,
  SummaryItemVO,
} from "@/api/agent_profit.api";

const { t } = useI18n();

const loading = ref(false);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const agentProfit = ref<AgentProfitVO[]>([] as AgentProfitVO[]);
const queryParams = reactive<AgentProfitPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 10,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  income_type: null,
});

const labelText = computed(() => {
  switch (queryParams.date_mode) {
    case "D":
      return "YESTERDAY";
    case "W":
      return "LAST_WEEK";
    case "M":
      return "LAST_MONTH";
    default:
      return "";
  }
});

function handleQuery() {
  loading.value = true;
  AgentProfitAPI.getAgentProfitData(queryParams)
    .then(({ result, data, summary }) => {
      if (result) {
        summaryAry.value = [
          {
            title: "PRE_REVENUE_SHARE",
            value: summary.income_gold,
            previous: summary.income_gold_previous,
            increase: summary.income_gold_increase,
            trend: summary.split_gold_trend,
            imageSrc: "poker",
          },
          {
            title: "POST_REVENUE_SHARE",
            value: summary.agent_split_gold,
            previous: summary.agent_split_gold_previous,
            increase: summary.agent_split_gold_increase,
            trend: summary.agent_split_gold_trend,
            imageSrc: "poker2",
          },
          {
            title: "AGENT_PRE_REVENUE_SHARE",
            value: summary.split_gold,
            previous: summary.split_gold_previous,
            increase: summary.split_gold_increase,
            trend: summary.split_gold_trend,
            imageSrc: "poker2",
          },
        ];
        agentProfit.value = data;
      }
    })
    .catch(() => {
      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_AGENT_PROFIT") })}`);
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  handleQuery();
});
</script>
