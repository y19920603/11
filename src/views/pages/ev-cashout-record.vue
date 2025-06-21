<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="EV_CASH_OUT_RECORD"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'ev-cash-out-record'"
      :excelApiUrl="'/ev-cashout-record/excel'"
      :orderName="'ev_time'"
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
        <el-popover
          class="box-item"
          :width="220"
          :content="$t('EV_CASH_OUT_RECORD_SEARCH_POPOVER_CONTENT')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="min-w-[220px]! h-[40px]!"
              :placeholder="$t('AGENT_PROFIT_KEY_SEARCH_PLACEHOLDER')"
            ></el-input>
          </template>
        </el-popover>
        <SearchButtons :resetBtn="false" @search="updateDataTable" />
      </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";

import EvCashOutRecordAPI, {
  EvCashOutRecordPageQuery,
  EvCashOutRecordVO,
} from "@/api/ev_cash_out_record.api";
import { SummaryItemVO } from "@/api/types/summary";
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
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<EvCashOutRecordVO[]>([] as EvCashOutRecordVO[]);
const queryParams = reactive<EvCashOutRecordPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "ev_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
});

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
  { data: "agent_name", title: t("EV_CASH_OUT_RECORD_AGENT_NAME") },
  { data: "nickname", title: t("EV_CASH_OUT_RECORD_NICKNAME") },
  { data: "account", title: t("EV_CASH_OUT_RECORD_ACCOUNT") },
  { data: "client_uid", title: t("EV_CASH_OUT_RECORD_CLIENT_UID"), className: "text-left!" },
  { data: "round_id", title: t("EV_CASH_OUT_RECORD_ROUND_ID") },
  {
    data: "all_pots_name",
    title: t("EV_CASH_OUT_RECORD_ALL_POTS"),
    className: "text-left!",
    render: (_data: string, _name: string, _row: EvCashOutRecordVO) => _row.all_pots_name,
  },
  {
    data: "round_type_name",
    title: t("EV_CASH_OUT_RECORD_ROUND_TYPE"),
    className: "text-left!",
    render: (_data: string, _name: string, _row: EvCashOutRecordVO) => _row.round_type_name,
  },
  {
    data: "hand_card",
    title: t("EV_CASH_OUT_RECORD_HAND_CARD"),
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
    data: "board_card",
    title: t("EV_CASH_OUT_RECORD_BOARD_CARD"),
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
  { data: "pots_all_gold", title: t("EV_CASH_OUT_RECORD_POTS_ALL_GOLD") },
  {
    data: "ev_gold",
    title: t("EV_CASH_OUT_RECORD_EV_GOLD"),
    render: (data: string) => `<span class="text-red">${data} </span>`,
  },
  {
    data: "ev_earnings",
    title: t("EV_CASH_OUT_RECORD_EV_EARNINGS"),
    render: (data: string) => `<span>$${data} </span>`,
  },
  { data: "win_rate", title: t("EV_CASH_OUT_RECORD_WIN_RATE") },
  {
    data: "is_buy_name",
    className: "text-center!",
    title: t("EV_CASH_OUT_RECORD_IS_BUY"),
    render: (data: string, _name: string, _row: EvCashOutRecordVO) => {
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${_row.is_buy === 0 ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
            ${_row.is_buy_name}
          </div>
        `;
    },
  },
  {
    data: "is_win_name",
    title: t("EV_CASH_OUT_RECORD_IS_WIN"),
    className: "text-left!",
    render: (data: string, _name: string, _row: EvCashOutRecordVO) =>
      `<span>${_row.is_win_name} </span>`,
  },
  {
    data: "get_pots_name",
    title: t("EV_CASH_OUT_RECORD_GET_POTS"),
    className: "text-center!",
    render: (data: string, _name: string, _row: EvCashOutRecordVO) => {
      if (_row.get_pots !== 1) return "";
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto text-center bg-[--bg-success] text-[--text-success]" >
            ${_row.get_pots_name}
          </div>
        `;
    },
  },
  {
    data: "ev_time",
    title: t("EV_CASH_OUT_RECORD_EV_TIME"),
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
        <span>${date[0]}</span>
        <span>${date[1]}</span>
      </div>`;
    },
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  EvCashOutRecordAPI.getEvCashOutRecordData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "EV_CASH_OUT_RECORD_EV_TOTAL_CASHBACK_USD",
            value: `$${summary.ev_totalAmount}`,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "ev2",
          },
          {
            title: "EV_CASH_OUT_RECORD_EV_TOTAL_EARNINGS_USD",
            value: `$${summary.ev_totalBonus}`,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "ev",
          },
          {
            title: "EV_CASH_OUT_RECORD_EV_CASHBACK_TOTAL_COUNT",
            value: summary.ev_totalCount,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "",
          },
          {
            title: "EV_CASH_OUT_RECORD_EV_CASHBACK_ACCEPT_COUNT",
            value: summary.ev_acceptCount,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "ev3",
          },
          {
            title: "EV_CASH_OUT_RECORD_EV_CASHBACK_REJECT_COUNT",
            value: summary.ev_rejectCount,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "ev4",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_EV_CASH_OUT_RECORD");
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(() => {
  handleQuery();
});
</script>
