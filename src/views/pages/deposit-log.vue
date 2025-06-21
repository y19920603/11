<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="DEPOSIT_LOG"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" :date_mode="queryParams.date_mode" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'deposit-log'"
      :excelApiUrl="'/deposit-log/excel'"
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
          :content="$t('DEPOSIT_LOG_SEARCH_POPOVER_CONTENT')"
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
import $ from "jquery";
import downloadPDFUtil from "@/utils/pdf";

import DepositLogAPI, { DepositLogPageQuery, DepositLogVO } from "@/api/deposit_log.api";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import pdf from "@/assets/images/download.png";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<DepositLogVO[]>([] as DepositLogVO[]);
const queryParams = reactive<DepositLogPageQuery>({
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
  { data: "null" },
  { data: "id", visible: false },
  { data: "agent_name", title: t("DEPOSIT_LOG_AGENT_NAME") },
  { data: "company_name", title: t("DEPOSIT_LOG_COMPANY_NAME") },
  { data: "client_uid", title: t("DEPOSIT_LOG_CLIENT_UID"), className: "text-left!" },
  { data: "account", title: t("DEPOSIT_LOG_ACCOUNT") },
  { data: "cause_text", title: t("DEPOSIT_LOG_CAUSE_TEXT") },
  { data: "old_deposit", title: t("DEPOSIT_LOG_OLD_DEPOSIT") },
  { data: "add_deposit", title: t("DEPOSIT_LOG_ADD_DEPOSIT") },
  { data: "new_deposit", title: t("DEPOSIT_LOG_NEW_DEPOSIT") },
  { data: "round_id", title: t("DEPOSIT_LOG_ROUND_ID") },
  {
    data: "create_time",
    title: t("DEPOSIT_LOG_CREATE_TIME"),
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
    data: "",
    title: t("DEPOSIT_LOG_PDF"),
    className: "text-center!",
    orderable: false,
    render: (_data: number, _name: string, row: DepositLogVO) => {
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
  downloadPDFUtil("/deposit-log/pdf", { id }, "deposit-log");
};

function handleQuery() {
  setLoading(true);
  DepositLogAPI.getDepositLogData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "DEPOSIT_LOG_CHANGED_MARGIN",
            value: `$${summary.add_deposit}`,
            previous: `$${summary.add_deposit_previous}`,
            increase: summary.add_deposit_increase,
            trend: summary.add_deposit_trend,
            imageSrc: "poker",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_DEPOSIT_LOG");
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
};

onMounted(() => {
  handleQuery();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
