<template>
  <PageTitle title="MASTER_PROFIT_LIST" />
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
      <!-- 日期選擇器 -->
      <template #dateFilter>
        <DateTimeFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          @updateDateTime="updateDataTable"
        />
      </template>

      <!-- 關鍵字搜尋 -->
      <template #searchFilter>
        <!-- 說明文字 -->
        <div class="text-xs text-red-500 leading-tight whitespace-nowrap mr-4">
          <div>
            * {{ $t("MASTER_PROFIT_COMMISSION") }}：{{ $t("MASTER_PROFIT_COMMISSION_HINT") }}
          </div>
          <div>
            * {{ $t("MASTER_PROFIT_WITHDRAWAL") }}：{{ $t("MASTER_PROFIT_WITHDRAWAL_HINT") }}
          </div>
        </div>
        <el-select
          v-model="causeType"
          class="min-w-[160px] w-full"
          size="large"
          :placeholder="$t('MASTER_PROFIT_CAUSE')"
          :clearable="true"
        >
          <el-option
            v-for="item in causeCategorys"
            :key="item.cause"
            :label="item.cause_text"
            :value="item.cause"
          />
        </el-select>
        <el-popover
          class="box-item"
          :width="220"
          :content="$t('MASTER_PROFIT_SEARCH_HINT')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="min-w-[220px]!"
              size="large"
              :placeholder="$t('MASTER_PROFIT_SEARCH_PLACEHOLDER')"
            ></el-input>
          </template>
        </el-popover>

        <SearchButtons :resetBtn="false" @search="updateDataTable" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import MasterProfitAPI from "@/api/master-profit.api";
import type { MasterProfitQuery } from "@/api/master-profit.api";
import { SummaryItemVO } from "@/api/types/summary";
import { useCauseTypes } from "@/utils/causeTypes";
import { getDataErrorAlert } from "@/utils/message";
const { t, locale } = useI18n();
import { useLoadingStore } from "@/store";

// 狀態區
const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<any[]>([]);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);

// 查詢參數
const queryParams = reactive<MasterProfitQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  cause: null,
});

const causeCategorys = ref(useCauseTypes(t));
const causeType = computed({
  get: () => {
    return queryParams.cause ?? "";
  },
  set: (newValue) => {
    queryParams.cause = newValue;
  },
});

// 欄位定義
const getColumns = () => [
  { data: "null", visible: false },
  { data: "agent_name", title: t("MASTER_PROFIT_AGENT_NAME") },
  { data: "account", title: t("MASTER_PROFIT_ACCOUNT") },
  { data: "nickname", title: t("MASTER_PROFIT_NICKNAME") },
  { data: "table_id", title: t("MASTER_PROFIT_TABLE_ID"), className: "text-left!" },
  { data: "round_id", title: t("MASTER_PROFIT_ROUND_ID") },
  { data: "game_nickname", title: t("MASTER_PROFIT_GAME_NAME") },
  { data: "rake", title: t("MASTER_PROFIT_RAKE") },
  { data: "amounts", title: t("MASTER_PROFIT_AMOUNT") },
  { data: "gold_old", title: t("MASTER_PROFIT_GOLD_OLD") },
  { data: "gold_new", title: t("MASTER_PROFIT_GOLD_NEW") },
  { data: "cause", title: t("MASTER_PROFIT_CAUSE") },
  {
    data: "create_time",
    title: t("MASTER_PROFIT_CREATE_TIME"),
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

// 根據語系重新載入欄位
watch(locale, () => {
  columns.value = getColumns();
  causeCategorys.value = useCauseTypes(t);
  updateDataTable({}, false);
});

// 更新表格與 summary
function handleQuery() {
  setLoading(true);

  MasterProfitAPI.get(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data.map((item) => ({ ...item }));
        total.value = records_total;
        summaryAry.value = [
          {
            title: "MASTER_PROFIT_COMMISSION",
            value: summary.commission,
            imageSrc: "poker2",
            previous: "",
            increase: "",
            trend: "",
          },
          {
            title: "MASTER_PROFIT_WITHDRAWAL",
            value: summary.withdrawal,
            imageSrc: "poker",
            previous: "",
            increase: "",
            trend: "",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_MASTER_PROFIT_LIST");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 查詢條件更新時的觸發器
const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) data = { ...data, start: 0 };
  Object.assign(queryParams, data);
  handleQuery();
};

// 初始載入
onMounted(() => {
  handleQuery();
});
</script>
