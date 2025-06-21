<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="ROUND_SEAT_LOG"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" :date_mode="queryParams.date_mode" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'round-seat-log_table'"
      :excelApiUrl="'/round-seat-log/excel'"
      :orderName="'round_end_time'"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <DateFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          @updateDateTime="updateDataTable"
        />
      </template>
      <template #searchFilter>
        <div
          class="space-y-2 2xl:flex 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-15 2xl:z-1"
        >
          <template v-if="!isPlayer">
            <div class="space-y-2 md:flex md:space-y-0 md:space-x-2">
              <el-input
                v-model="queryParams.account"
                class="h-[40px]! min-w-[300px]!"
                :placeholder="$t('ROUND_SEAT_LOG_ACCOUNT')"
              ></el-input>
              <el-input
                v-model="queryParams.agent_name"
                class="h-[40px]! min-w-[300px]!"
                :placeholder="$t('ROUND_SEAT_LOG_AGENT_NAME')"
              ></el-input>
            </div>
            <div class="space-y-2 md:flex md:space-y-0 md:space-x-2">
              <el-input
                v-model="queryParams.client_uid"
                class="h-[40px]! min-w-[300px]!"
                :placeholder="$t('ROUND_SEAT_LOG_CLIENT_UID')"
              ></el-input>
              <el-input
                v-model="queryParams.round_id"
                class="h-[40px]! min-w-[300px]!"
                :placeholder="$t('ROUND_SEAT_LOG_ROUND_ID')"
              ></el-input>
            </div>
            <div class="space-y-2 md:flex md:space-y-0 md:space-x-2">
              <div class="flex space-x-2 md:flex-1 2xl:w-[300px]">
                <el-select
                  v-model="seaType"
                  :placeholder="$t('ROUND_SEAT_LOG_TABLE_TYPE')"
                  :clearable="true"
                  class="flex-1 max-w-[120px]"
                  size="large"
                >
                  <el-option
                    v-for="item in seaTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-select
                  v-model="serverId"
                  :placeholder="$t('ROUND_SEAT_LOG_GAME_TYPE')"
                  :clearable="true"
                  class="flex-1"
                  size="large"
                >
                  <el-option
                    v-for="item in gameModes"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </div>
              <el-input
                v-model="queryParams.search"
                class="h-[40px]! min-w-[300px]! md:flex-1"
                :placeholder="$t('ROUND_SEAT_LOG_NICKNAME')"
              ></el-input>
            </div>
          </template>
          <template v-else>
            <div
              class="space-y-2 md:flex md:space-y-0 md:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2"
            >
              <el-select
                v-model="seaType"
                :placeholder="$t('ROUND_SEAT_LOG_TABLE_TYPE')"
                :clearable="true"
                class="md:w-[220px]! 2xl:w-[280px]!"
                size="large"
              >
                <el-option
                  v-for="item in seaTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-input
                v-model="queryParams.round_id"
                class="h-[40px]! md:w-[180px]! 2xl:w-[280px]!"
                :placeholder="$t('ROUND_SEAT_LOG_ROUND_ID')"
              ></el-input>
              <el-input
                v-model="queryParams.search"
                class="h-[40px]! md:w-[180px]! 2xl:w-[280px]!"
                :placeholder="$t('ROUND_SEAT_LOG_NICKNAME')"
              ></el-input>
            </div>
          </template>
          <div class="flex space-x-2">
            <SearchButtons @reset="resetSearch" @search="updateDataTable" />
          </div>
        </div>
      </template>
    </DataTable>
    <RoundSeatLogDialog v-model:visible="isDialogVisible" :roundId="showDetailId" />
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import $ from "jquery";

import RoundSeatLogAPI, { RoundSeatLogPageQuery, RoundSeatLogVO } from "@/api/round_seat_log.api";
import downloadPDFUtil from "@/utils/pdf";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useSeaTypes } from "@/utils/seaTypes";
import { useLoadingStore } from "@/store/modules/loading.store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { getPoker } from "@/utils/poker";
import pdf from "@/assets/images/download.png";

const { t, locale } = useI18n();
const route = useRoute();
const isPlayer = ref(false);

const serverId = computed({
  get: () => {
    return queryParams.server_id ?? "";
  },
  set: (newValue) => {
    queryParams.server_id = newValue;
  },
});

const seaType = computed({
  get: () => {
    return queryParams.sea_type ?? "";
  },
  set: (newValue) => {
    queryParams.sea_type = newValue;
  },
});

const seaTypes = ref(useSeaTypes(t));

watch(locale, () => {
  columns.value = getColumns();
  seaTypes.value = useSeaTypes(t);
  updateDataTable({}, false);
});
const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<RoundSeatLogVO[]>([] as RoundSeatLogVO[]);
const gameModes = ref<EnumVO[]>([] as EnumVO[]);
const queryParams = reactive<RoundSeatLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "round_end_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  sea_type: null,
  server_id: null,
  agent_name: null,
  client_uid: null,
  account: null,
  round_id: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: "",
    sea_type: "",
    server_id: "",
    agent_name: "",
    client_uid: "",
    account: "",
    round_id: "",
  });
};

const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

const getColumns = () => [
  { data: "null" },
  { data: "id", visible: false },
  { data: "agent_name", title: t("ROUND_SEAT_LOG_AGENT_NAME") },
  { data: "client_uid", title: t("ROUND_SEAT_LOG_CLIENT_UID"), className: "text-left!" },
  { data: "account", title: t("ROUND_SEAT_LOG_ACCOUNT") },
  { data: "nickname", title: t("ROUND_SEAT_LOG_NICKNAME") },
  { data: "table_id", title: t("ROUND_SEAT_LOG_TABLE_ID"), className: "text-left!" },
  { data: "round_id", title: t("ROUND_SEAT_LOG_ROUND_ID") },
  {
    data: "round_end_time",
    title: t("ROUND_SEAT_LOG_ROUND_END_TIME"),
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
    data: "round_belong",
    title: t("ROUND_SEAT_LOG_TABLE_TYPE"),
    className: "text-left!",
  },
  { data: "game_type_name", title: t("ROUND_SEAT_LOG_GAME_TYPE") },
  {
    data: "card",
    title: t("ROUND_SEAT_LOG_CARD"),
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
    title: t("ROUND_SEAT_LOG_BOARD_CARD_0"),
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
    data: "AF_name",
    title: t("ROUND_SEAT_LOG_AF"),
    className: "text-center!",
    render: (data: number, _name: string, _row: RoundSeatLogVO) => {
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${_row.AF === 0 ? "bg-[#CCCCCC] text-white dark:text-[#666666]" : _row.AF === 1 ? "bg-[--bg-error] text-[--text-error]" : _row.AF === 2 ? "bg-[--bg-success] text-[--text-success]" : ""}" >
            ${data}
          </div>
        `;
    },
  },
  { data: "gold_old", title: t("ROUND_SEAT_LOG_GOLD_OLD") },
  { data: "gold_new", title: t("ROUND_SEAT_LOG_GOLD_NEW") },
  { data: "pots_all_gold", title: t("ROUND_SEAT_LOG_POTS_ALL_GOLD") },
  { data: "gold_add", title: t("ROUND_SEAT_LOG_GOLD_ADD") },
  {
    data: "contribution",
    title: t("ROUND_SEAT_LOG_CONTRIBUTION"),
    className: "text-center!",
    render: (_data: number, _name: string, row: RoundSeatLogVO) => {
      return `
      <div class="flex justify-center items-center flex-col">
        <span>${row.contribution_ratio_1}</span>
        <span>${row.contribution_ratio_2}</span>
      </div>
    `;
    },
  },
  { data: "gold_type", title: t("ROUND_SEAT_LOG_GOLD_TYPE") },
  { data: "rake", title: t("ROUND_SEAT_LOG_RAKE") },
  { data: "rake_gold", title: t("ROUND_SEAT_LOG_RAKE_GOLD") },
  { data: "round_rake_gold", title: t("ROUND_SEAT_LOG_ROUND_RAKE_GOLD") },
  { data: "buy_ev_gold", title: t("ROUND_SEAT_LOG_BUY_EV_GOLD") },
  { data: "ip", title: t("ROUND_SEAT_LOG_IP") },
  {
    data: "uid",
    title: t("ROUND_SEAT_LOG_DETAIL"),
    orderable: false,
    className: "text-center!",
    render: (_data: number, _name: string, _row: RoundSeatLogVO) => {
      return `
        <button class="text-center cursor-pointer  bg-[#B163FF] px-4 py-2 rounded-full detail text-white" data-id="${_row.round_id}">
          ${t("BUTTON_DETAIL")}
        </button>`;
    },
  },
  {
    data: "",
    title: t("ROUND_SEAT_LOG_PDF"),
    className: "text-center!",
    orderable: false,
    render: (_data: number, _name: string, row: RoundSeatLogVO) => {
      return `
      <div class="text-center cursor-pointer pdf_download" data-id="${row.id}">
        <img src="${pdf}" alt="" height="35px" width="35px" />
      </div>
    `;
    },
  },
];
const columns = ref(getColumns());

const downloadPDF = (id: string) => {
  downloadPDFUtil("/round-seat-log/pdf", { id }, "round-seat-log");
};

function handleQuery() {
  setLoading(true);
  RoundSeatLogAPI.getRoundSeatLogData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "ROUND_SEAT_LOG_TOTAL_BET_AMOUNT",
            value: `$${summary.contribution}`,
            previous: `$${summary.contribution_previous}`,
            increase: summary.contribution_increase,
            trend: summary.contribution_trend,
            imageSrc: "poker",
          },
          {
            title: "ROUND_SEAT_LOG_TOTAL_GAME_ROUNDS",
            value: summary.round_count,
            previous: summary.round_count_previous,
            increase: summary.round_count_increase,
            trend: summary.round_count_trend,
            imageSrc: "poker3",
          },
          {
            title: "ROUND_SEAT_LOG_TOTAL_PLAYERS",
            value: summary.player_count,
            previous: summary.player_count_previous,
            increase: summary.player_count_increase,
            trend: summary.player_count_trend,
            imageSrc: "poker4",
          },
          {
            title: "ROUND_SEAT_LOG_TOTAL_PLAYERS_PROFIT_AND_LOSS",
            value: `$${summary.gold_add}`,
            previous: `$${summary.gold_add_previous}`,
            increase: summary.gold_add_increase,
            trend: summary.gold_add_trend,
            imageSrc: "poker",
          },
          {
            title: "ROUND_SEAT_LOG_TOTAL_RAKE",
            value: `$${summary.rake_gold}`,
            previous: `$${summary.rake_gold_previous}`,
            increase: summary.rake_gold_increase,
            trend: summary.rake_gold_trend,
            imageSrc: "poker2",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_ROUND_SEAT_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}

function getGameModes() {
  setLoading(true);

  EnumAPI.get("ServerId")
    .then((res) => {
      gameModes.value = res.filter((item) => item.id !== 0);
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_ROUND_SEAT_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}
const isDialogVisible = ref(false);
const showDetailId = ref<string | null>(null);

const bindingEvent = () => {
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .pdf_download`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .pdf_download`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        const element = this as HTMLDivElement;
        const id = $(element).data("id");
        downloadPDF(id);
      }
    );

  $("body")
    .off("click", ".detail")
    // eslint-disable-next-line no-unused-vars
    .on("click", ".detail", function (this: HTMLElement) {
      const element = this as HTMLDivElement;
      const id = $(element).data("id");
      isDialogVisible.value = true;
      showDetailId.value = id;
    });
};

onMounted(() => {
  const { client_uid, start_datetime, end_datetime, date_mode } = route.query;

  if (client_uid && start_datetime && end_datetime) {
    queryParams.client_uid = client_uid as string;
    queryParams.start_datetime = start_datetime as string;
    queryParams.end_datetime = end_datetime as string;
    queryParams.date_mode = date_mode as string | null;
    isPlayer.value = true;
  }

  getGameModes();

  handleQuery();

  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
