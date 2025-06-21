<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="GA_PROFIT"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" :date_mode="queryParams.date_mode" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'profit_table'"
      :excelApiUrl="'/ga-profit/excel'"
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
        <el-select
          v-model="incomeType"
          :placeholder="$t('AGENT_PROFIT_INCOME_TYPE')"
          size="large"
          class="min-w-[160px]!"
          :clearable="true"
        >
          <el-option
            v-for="item in incomeTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-popover
          class="box-item"
          :width="220"
          :content="$t('AGENT_PROFIT_SEARCH_POPOVER_CONTENT')"
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

        <div class="flex space-x-2">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import $ from "jquery";

import GaProfitAPI, { GaProfitPageQuery, GaProfitVO } from "@/api/ga_profit.api";
import downloadPDFUtil from "@/utils/pdf";
import { SummaryItemVO } from "@/api/types/summary";
import { useIncomeTypes } from "@/utils/incomeTypes";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import pdf from "@/assets/images/download.png";
import getGoldImg from "@/utils/goldImg";

const { t, locale } = useI18n();

const route = useRoute();

const incomeType = computed({
  get: () => {
    return queryParams.income_type ?? "";
  },
  set: (newValue) => {
    queryParams.income_type = newValue;
  },
});

const incomeTypes = ref(useIncomeTypes(t));

watch(locale, () => {
  columns.value = getColumns();
  incomeTypes.value = useIncomeTypes(t);
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<GaProfitVO[]>([] as GaProfitVO[]);
const queryParams = reactive<GaProfitPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  income_type: null,
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
    search: null,
    income_type: null,
  });
};

const getColumns = () => [
  { data: "null" },
  { data: "id", visible: false },
  { data: "ga_name", title: t("GA_PROFIT_GA_NAME") },
  { data: "ga_company_name", title: t("GA_PROFIT_GA_COMPANY_NAME") },
  { data: "agent_name", title: t("GA_PROFIT_AGENT_NAME") },
  { data: "company_name", title: t("GA_PROFIT_COMPANY_NAME") },
  { data: "income_type_name", title: t("GA_PROFIT_INCOME_TYPE") },
  { data: "round_id", title: t("GA_PROFIT_ROUND_ID") },
  { data: "account", title: t("GA_PROFIT_ACCOUNT") },
  { data: "income_gold", title: t("GA_PROFIT_INCOME_GOLD") },
  { data: "ga_split", title: t("GA_PROFIT_GA_SPLIT") },
  { data: "agent_split", title: t("GA_PROFIT_AGENT_SPLIT") },
  {
    data: "ga_split_gold",
    title: t("GA_PROFIT_GA_SPLIT_GOLD"),
    className: "text-right!",
    render: (data: string, _name: string, row: GaProfitVO) => {
      if (row.income_type === 3)
        return `
          <span class="text-red">--</span>
        `;
      return `
          <span class="text-[#59AFFF]">${data}</span>
        `;
    },
  },
  {
    data: "ga_split_gold_del",
    title: t("GA_PROFIT_GA_SPLIT_GOLD_DEL"),
    className: "text-right!",
    render: (data: string, _name: string, row: GaProfitVO) => {
      if (row.income_type === 3)
        return `
        <span class="text-[#59AFFF]">${data}</span>
        `;
      return `
        <span class="text-red">--</span>
        `;
    },
  },
  {
    data: "agent_split_gold",
    title: t("GA_PROFIT_AGENT_SPLIT_GOLD"),
    className: "text-right!",
    render: (data: string, _name: string, row: GaProfitVO) => {
      if (row.income_type === 3)
        return `
          <span class="text-red">--</span>
        `;
      return `
          <span class="text-[#59AFFF]">${data}</span>
        `;
    },
  },
  {
    data: "agent_split_gold_del",
    title: t("GA_PROFIT_AGENT_SPLIT_GOLD_DEL"),
    className: "text-right!",
    render: (data: string, _name: string, row: GaProfitVO) => {
      if (row.income_type === 3)
        return `
        <span class="text-[#59AFFF]">${data}</span>
        `;
      return `
        <span class="text-red">--</span>
        `;
    },
  },
  {
    data: "gold_type_name",
    title: t("GA_PROFIT_GOLD_TYPE"),
    className: "text-center!",
    render: (data: string, _name: string, row: GaProfitVO) => `<div class="text-center">
              <img src="${getGoldImg(row.gold_type.toString())}" alt="" height="35px" width="35px" />
              <div>${data ?? ""}</div>
        </div>`,
  },
  {
    data: "round_belong",
    title: t("GA_PROFIT_SEA_TYPE"),
    className: "text-center!",
    render: (data: string) => {
      const dataAry = data.split("/");
      return `<div class="flex-col justify-center items-center">
                <div>${dataAry[0]}/${dataAry[1]}</div>
                <div>${dataAry[2]}</div>
      </div>`;
    },
  },
  {
    data: "settlement_status_name",
    title: t("AGENT_TRANSFER_SETTLEMENT_STATUS"),
    className: "text-center!",
    render: (data: string, _name: string, row: GaProfitVO) => {
      const statusClassMap: Record<number, string> = {
        0: "dark:text-[#666666] bg-[#cccccc] text-[#fff]",
        1: "bg-[--bg-success] text-[--text-success]",
      };
      const colorClass = statusClassMap[row.settlement_status];

      if (colorClass) {
        return `
        <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${colorClass}">
          ${data}
        </div>
      `;
      } else {
        return `<div>${data}</div>`;
      }
    },
  },
  {
    data: "create_time",
    title: t("AGENT_PROFIT_CREATE_TIME"),
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
        <span>${date[0]}</span>
        <span>${date[1]}</span>
      </div>`;
    },
  },
  {
    data: "",
    title: t("GA_PROFIT_PDF"),
    className: "text-center!",
    orderable: false,
    render: (_data: number, _name: string, row: GaProfitVO) => {
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
  downloadPDFUtil("/ga-profit/pdf", { id }, "ga-profit");
};

function handleQuery() {
  setLoading(true);
  GaProfitAPI.getGaProfitData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "GA_PROFIT_INCOME_BEFORE_SPLIT",
            value: `$${summary.income_gold}`,
            previous: `$${summary.income_gold_previous}`,
            increase: summary.income_gold_increase,
            trend: summary.income_gold_trend,
            imageSrc: "poker",
          },
          {
            title: "GA_PROFIT_INCOME_AFTER_SPLIT",
            value: `$${summary.GA_split_gold}`,
            previous: `$${summary.GA_split_gold_previous}`,
            increase: summary.GA_split_gold_increase,
            trend: summary.GA_split_gold_trend,
            imageSrc: "poker2",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_GA_PROFIT");
    })
    .finally(() => {
      setLoading(false);
    });
}

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
};
onMounted(() => {
  handleQuery();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
