<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="PROFIT_LOG"></PageTitle>

  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'profit-log'"
      :excelApiUrl="'/profit-log/excel'"
      :orderName="'date_time'"
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
          :content="$t('PROFIT_LOG_SEARCH_POPOVER_CONTENT')"
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

import profitLogAPI, { ProfitLogPageQuery, ProfitLogVO } from "@/api/profit_log.api";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<ProfitLogVO[]>([] as ProfitLogVO[]);
const queryParams = reactive<ProfitLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "date_time",
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
  { data: "order_id", title: t("PROFIT_LOG_ORDER_ID"), className: "text-left!" },
  { data: "agent_name", title: t("PROFIT_LOG_AGENT_NAME") },
  { data: "account", title: t("PROFIT_LOG_ACCOUNT") },
  { data: "cause", title: t("PROFIT_LOG_CAUSE") },
  { data: "shop_revenue", title: t("PROFIT_LOG_SHOP_REVENUE") },
  { data: "shop_split", title: t("PROFIT_LOG_SHOP_SPLIT") },
  { data: "host_withdrawal", title: t("PROFIT_LOG_HOST_WITHDRAWAL") },
  { data: "deposit", title: t("PROFIT_LOG_DEPOSIT") },
  { data: "withdrawal", title: t("PROFIT_LOG_WITHDRAWAL") },
  {
    data: "date_time",
    title: t("PROFIT_LOG_DATE_TIME"),
    className: "text-left!",
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
  profitLogAPI
    .getProfitLogData(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PROFIT_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(() => {
  handleQuery();
});
</script>
