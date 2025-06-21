<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="STORE_TRADE_RECORD_LIST"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
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
          :content="$t('STORE_TRADE_RECORD_LIST_SEARCH_POPOVER_CONTENT')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="h-[40px]! min-w-[220px]"
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

import StoreTradeRecordListAPI, {
  StoreTradeRecordListPageQuery,
  StoreTradeRecordListVO,
} from "@/api/store_trade_record_list.api";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<StoreTradeRecordListVO[]>([] as StoreTradeRecordListVO[]);
const queryParams = reactive<StoreTradeRecordListPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
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
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "agent_name", title: t("STORE_TRADE_RECORD_LIST_AGENT_NAME") },
  { data: "order_id", title: t("STORE_TRADE_RECORD_LIST_ORDER_ID"), className: "text-left!" },
  { data: "account", title: t("STORE_TRADE_RECORD_LIST_ACCOUNT") },
  { data: "nickname", title: t("STORE_TRADE_RECORD_LIST_NICKNAME") },
  { data: "product_id", title: t("STORE_TRADE_RECORD_LIST_PRODUCT_ID") },
  { data: "product_name", title: t("STORE_TRADE_RECORD_LIST_PRODUCT_NAME") },
  { data: "gold", title: t("STORE_TRADE_RECORD_LIST_GOLD") },
  { data: "ga_split", title: t("STORE_TRADE_RECORD_LIST_GA_SPLIT") },
  { data: "ga_split_gold", title: t("STORE_TRADE_RECORD_LIST_GA_SPLIT_GOLD") },
  { data: "agent_split", title: t("STORE_TRADE_RECORD_LIST_AGENT_SPLIT") },
  { data: "agent_split_gold", title: t("STORE_TRADE_RECORD_LIST_AGENT_SPLIT_GOLD") },
  {
    data: "create_time",
    title: t("STORE_TRADE_RECORD_LIST_CREATE_TIME"),
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
  StoreTradeRecordListAPI.get(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data.map((e) => ({ ...e, id: e.order_id }));
        total.value = records_total;
        summaryAry.value = [
          {
            title: "STORE_TRADE_RECORD_LIST_GOLD_AMOUNT",
            value: `$${summary.gold_amount}`,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "poker",
          },
          {
            title: "STORE_TRADE_RECORD_LIST_GA_SPLIT_GOLD_AMOUNT",
            value: `$${summary.ga_split_gold_amount}`,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "poker2",
          },
          {
            title: "STORE_TRADE_RECORD_LIST_AGENT_SPLIT_GOLD_AMOUNT",
            value: `$${summary.agent_split_gold_amount}`,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "poker2",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_STORE_TRADE_RECORD_LIST");
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(() => {
  handleQuery();
});
</script>
