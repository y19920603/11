<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="PLAY_GAME_LOG"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" :date_mode="queryParams.date_mode" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'player-game-log_table'"
      :excelApiUrl="'/player-game-log/excel'"
      :orderName="'client_uid'"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <DateFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          :orderName="'client_uid'"
          @updateDateTime="updateDataTable"
        />
      </template>
      <template #searchFilter>
        <div
          class="space-y-2 xl:flex xl:space-x-2 xl:space-y-0 2xl:space-y-2 2xl:items-end 2xl:flex-col 2xl:absolute 2xl:z-1 2xl:right-0"
        >
          <div
            class="space-y-2 md:flex md:space-y-0 md:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:w-[320px]"
          >
            <el-input
              v-model="queryParams.account"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('ROUND_SEAT_LOG_ACCOUNT')"
            ></el-input>
            <el-input
              v-model="queryParams.agent_name"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('ROUND_SEAT_LOG_AGENT_NAME')"
            ></el-input>
            <el-input
              v-model="queryParams.client_uid"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('ROUND_SEAT_LOG_CLIENT_UID')"
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
import $ from "jquery";

import PlayGameLogAPI, { PlayGameLogPageQuery, PlayGameLogVO } from "@/api/player_game_log.api";
import downloadPDFUtil from "@/utils/pdf";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import pdf from "@/assets/images/download.png";

const { t, locale } = useI18n();
const router = useRouter();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<PlayGameLogVO[]>([] as PlayGameLogVO[]);
const queryParams = reactive<PlayGameLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "client_uid",
  sort_dir: 1,
  date_mode: "D",
  agent_name: null,
  client_uid: null,
  account: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    agent_name: "",
    client_uid: "",
    account: "",
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
  { data: "uid", visible: false },
  { data: "agent_name", title: t("PLAY_GAME_LOG_AGENT_NAME") },
  { data: "client_uid", title: t("PLAY_GAME_LOG_CLIENT_UID"), className: "text-left!" },
  { data: "account", title: t("PLAY_GAME_LOG_ACCOUNT") },
  { data: "nickname", title: t("PLAY_GAME_LOG_NICKNAME") },
  { data: "contribution", title: t("PLAY_GAME_LOG_CONTRIBUTION") },
  {
    data: "gold_add",
    title: t("PLAY_GAME_LOG_GOLD_ADD"),
    render: (data: string) =>
      `<span class='${parseFloat(data) < 0 ? "text-[#C35050]" : "text-[#59AFFF]"}'>${data}</span>`,
  },
  {
    data: "AF",
    title: t("PLAY_GAME_LOG_AF"),
    className: "text-center!",
    render: (data: string) => `
      <div class="rounded-full px-1 text-center bg-[--bg-success] text-[--text-success]">
        ${data}
      </div>
    `,
  },
  { data: "round_id_count", title: t("PLAY_GAME_LOG_ROUND_ID_COUNT") },
  {
    data: "server_id_1_count",
    title: t("PLAY_GAME_LOG_SERVER_ID_1_COUNT"),
    className: "text-[#50C38E]!",
  },
  {
    data: "server_id_2_count",
    title: t("PLAY_GAME_LOG_SERVER_ID_2_COUNT"),
    className: "text-[#B163FF]!",
  },
  {
    data: "server_id_3_count",
    title: t("PLAY_GAME_LOG_SERVER_ID_3_COUNT"),
    className: "text-[#C35050]!",
  },
  {
    data: "server_id_4_count",
    title: t("PLAY_GAME_LOG_SERVER_ID_4_COUNT"),
    className: "text-[#06af05]! dark:text-[#A7FF62]!",
  },
  { data: "gold_new", title: t("PLAY_GAME_LOG_GOLD_NEW") },
  {
    data: "agent_split_all_gold",
    title: t("PLAY_GAME_LOG_AGENT_SPLIT_ALL_GOLD"),
    render: (data: string) => `<span class="text-[#0EA691]">${data}</span>`,
  },
  { data: "rake_gold", title: t("PLAY_GAME_LOG_RAKE_GOLD") },
  { data: "buy_ev_gold_count", title: t("PLAY_GAME_LOG_BUY_EV_GOLD_COUNT") },
  { data: "buy_ev_gold", title: t("PLAY_GAME_LOG_BUY_EV_GOLD") },
  {
    data: "uid",
    title: t("PLAY_GAME_LOG_DETAIL"),
    orderable: false,
    className: "text-center!",
    render: (_data: number, _name: string, row: PlayGameLogVO) => {
      return `
        <button class="text-center cursor-pointer rounded-full bg-[#B163FF] px-4 py-2 view-detail text-white" data-client_uid="${row.client_uid}">
          ${t("BUTTON_VIEW")}
        </button>`;
    },
  },
  {
    data: "",
    title: t("PLAY_GAME_LOG_PDF"),
    className: "text-center!",
    orderable: false,
    render: (_data: number, _name: string, row: PlayGameLogVO) => {
      return `
      <div class="text-center cursor-pointer pdf_download" data-id="${row.client_uid}">
        <img src="${pdf}" alt="" height="35px" width="35px" />
      </div>
    `;
    },
  },
];
const columns = ref(getColumns());

const downloadPDF = (client_uid: string) => {
  downloadPDFUtil(
    "/player-game-log/pdf",
    {
      client_uid,
      start_datetime: queryParams.start_datetime,
      end_datetime: queryParams.end_datetime,
    },
    "player-game-log"
  );
};

function handleQuery() {
  setLoading(true);
  PlayGameLogAPI.getPlayGameLogData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "PLAY_GAME_LOG_TOTAL_BET_AMOUNT",
            value: `$${summary.contribution}`,
            previous: `$${summary.contribution_previous}`,
            increase: summary.contribution_increase,
            trend: summary.contribution_trend,
            imageSrc: "poker",
          },
          {
            title: "PLAY_GAME_LOG_TOTAL_RAKE",
            value: `$${summary.rake_gold}`,
            previous: `$${summary.rake_gold_previous}`,
            increase: summary.rake_gold_increase,
            trend: summary.rake_gold_trend,
            imageSrc: "poker2",
          },
          {
            title: "PLAY_GAME_LOG_TOTAL_GAME_ROUNDS",
            value: summary.round_count,
            previous: summary.round_count_previous,
            increase: summary.round_count_increase,
            trend: summary.round_count_trend,
            imageSrc: "poker3",
          },
          {
            title: "PLAY_GAME_LOG_TOTAL_PLAYERS",
            value: summary.player_count,
            previous: summary.player_count_previous,
            increase: summary.player_count_increase,
            trend: summary.player_count_trend,
            imageSrc: "poker4",
          },
          {
            title: "PLAY_GAME_LOG_TOTAL_PLAYERS_PROFIT_AND_LOSS",
            value: `$${summary.gold_add}`,
            previous: `$${summary.gold_add_previous}`,
            increase: summary.gold_add_increase,
            trend: summary.gold_add_trend,
            imageSrc: "poker",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAY_GAME_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}

const route = useRoute();
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
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .view-detail`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .view-detail`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        const client_uid = $(this).data("client_uid");
        const { start_datetime, end_datetime, date_mode } = queryParams;

        router.push({
          path: "/round-seat-log",
          query: {
            client_uid,
            start_datetime,
            end_datetime,
            date_mode,
          },
        });
      }
    );
};

onMounted(() => {
  handleQuery();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
