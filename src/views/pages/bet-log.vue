<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="BET_LOG"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'bet-log'"
      :excelApiUrl="'/bet-log/excel'"
      :orderName="'round_end_time'"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <DateTimeFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          @updateDateTime="updateDataTable"
        />
      </template>
      <template #searchFilter>
        <div
          class="space-y-2 xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-16 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2">
            <el-input
              v-model="queryParams.agent_name"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('BET_LOG_AGENT_NAME')"
            ></el-input>
            <el-input
              v-model="queryParams.round_id"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('BET_LOG_ROUND_ID')"
            ></el-input>
          </div>
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2">
            <el-input
              v-model="queryParams.account"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('BET_LOG_ACCOUNT')"
            ></el-input>
            <el-input
              v-model="queryParams.bet_id"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('BET_LOG_BET_ID')"
            ></el-input>
          </div>
          <div class="flex space-x-2">
            <SearchButtons @reset="resetSearch" @search="updateDataTable" />
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";

import BetLogAPI, { BetLogPageQuery, BetLogVO } from "@/api/bet_log.api";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import { getPoker } from "@/utils/poker";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<BetLogVO[]>([] as BetLogVO[]);
const queryParams = reactive<BetLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "round_end_time",
  sort_dir: 1,
  date_mode: "D",
  agent_name: "",
  account: "",
  round_id: "",
  bet_id: "",
});

const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

const resetSearch = () => {
  Object.assign(queryParams, {
    agent_name: "",
    account: "",
    round_id: "",
    bet_id: "",
  });
};

const getColumns = () => [
  { data: "null" },
  { data: "id", visible: false },
  { data: "bet_id", title: t("BET_LOG_BET_ID"), className: "text-left!" },
  { data: "agent_name", title: t("BET_LOG_AGENT_NAME") },
  { data: "account", title: t("BET_LOG_ACCOUNT") },
  {
    data: "round_start_time",
    title: t("BET_LOG_ROUND_START_TIME"),
    className: "text-left!",
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
        <span>${date[0]}</span>
        <span>${date[1]}</span>
      </div>`;
    },
  },
  {
    data: "round_end_time",
    title: t("BET_LOG_ROUND_END_TIME"),
    className: "text-left!",
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
        <span>${date[0]}</span>
        <span>${date[1]}</span>
      </div>`;
    },
  },
  { data: "round_id", title: t("BET_LOG_ROUND_ID") },
  { data: "game_type", title: t("BET_LOG_GAME_TYPE") },
  {
    data: "gold_add",
    title: t("BET_LOG_GOLD_ADD"),
    render: (data: string) =>
      `<span class="${parseFloat(data) < 0 ? "text-red" : "text-[#59AFFF]"}">${data}</span>`,
  },
  { data: "pots_all_gold", title: t("BET_LOG_POTS_ALL_GOLD") },
  { data: "bets", title: t("BET_LOG_BETS") },
  {
    data: "card",
    title: t("BET_LOG_CARD"),
    className: "text-center!",
    orderable: false,
    width: 150,
    render: (data: string) => {
      if (!data) return "";
      const hand_cards = data.split(",");
      return `
      <div class="flex justify-center items-center space-x-2">
        ${hand_cards.map((e) => `<img src="${getPoker(e)}" alt="${e}" height="26" />`).join("")}
      </div>
    `;
    },
  },
  {
    data: "board_card_0",
    title: t("BET_LOG_BOARD_CARD_0"),
    className: "text-center!",
    orderable: false,
    width: 150,
    render: (data: string) => {
      if (!data) return "";
      const hand_cards = data.split(",");
      return `
      <div class="flex justify-center items-center space-x-2">
        ${hand_cards.map((e) => `<img src="${getPoker(e)}" alt="${e}" height="26" />`).join("")}
      </div>
    `;
    },
  },
  { data: "ev_revenue", title: t("BET_LOG_EV_REVENUE") },
  { data: "ev_split", title: t("BET_LOG_EV_SPLIT") },
  { data: "rake_gold", title: t("BET_LOG_RAKE_GOLD") },
  { data: "rake_split", title: t("BET_LOG_RAKE_SPLIT") },
  { data: "rake", title: t("BET_LOG_RAKE") },
  { data: "rake_amount", title: t("BET_LOG_RAKE_AMOUNT") },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  BetLogAPI.getBetLogData(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_BET_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(() => {
  handleQuery();
});
</script>
