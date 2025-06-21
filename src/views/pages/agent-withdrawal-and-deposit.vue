<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="AGENT_DEPOSIT_WITHDRAWAL_RECORD"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" :date_mode="queryParams.date_mode" />
  </div>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :excelFileName="'agent-withdrawal-and-deposit'"
      :excelApiUrl="'/player-transfer/excel'"
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
          :content="$t('AGENT_TRANSFER_SEARCH_POPOVER_CONTENT')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="min-w-[220px]!"
              size="large"
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

import AgentTransferAPI, {
  AgentTransferPageQuery,
  AgentTransferVO,
} from "@/api/agent_transfer.api";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import pdf from "@/assets/images/download.png";
import getGoldImg from "@/utils/goldImg";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<AgentTransferVO[]>([] as AgentTransferVO[]);
const queryParams = reactive<AgentTransferPageQuery>({
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
  { data: "agent_name", title: t("AGENT_TRANSFER_AGENT_NAME") },
  { data: "company_name", title: t("AGENT_TRANSFER_COMPANY_NAME") },
  { data: "account", title: t("AGENT_TRANSFER_ACCOUNT") },
  {
    data: "cause_name",
    title: t("AGENT_TRANSFER_CAUSE_NAME"),
    render: (data: string, _name: string, row: AgentTransferVO) => {
      const colorMap: Record<number, string> = {
        1: "text-[#59AFFF]",
        2: "text-red",
      };
      const className = colorMap[row.cause];
      const content = row.cause_name ?? data;

      return `<div${className ? ` class="${className}"` : ""}>${content}</div>`;
    },
  },
  {
    data: "gold_add",
    title: t("AGENT_TRANSFER_GOLD_ADD"),
    render: (data: string) => {
      return `
        <span class="${parseFloat(data) < 0 ? "text-red" : "text-[#59AFFF]"}">${data}</span>
      `;
    },
  },
  {
    data: "currency",
    title: t("AGENT_TRANSFER_GOLD_TYPE"),
    className: "text-center!",
    render: (data: string, _name: string, row: AgentTransferVO) => `
      <div class="text-center">
            <img src="${getGoldImg(row.gold_type.toString())}" alt="" height="35px" width="35px" />
            <div>${data ?? ""}</div>
      </div>`,
  },
  { data: "client_uid", title: t("AGENT_TRANSFER_CLIENT_UID"), className: "text-left!" },
  { data: "gold_old", title: t("AGENT_TRANSFER_GOLD_OLD") },
  { data: "gold_new", title: t("AGENT_TRANSFER_GOLD_NEW") },
  {
    data: "status_name",
    title: t("AGENT_TRANSFER_SETTLEMENT_STATUS"),
    className: "text-center!",
    render: (data: number, _name: string, row: AgentTransferVO) => {
      return `
      <div
        class="rounded-full w-fit px-5 py-1 m-auto text-center
        ${!row.status ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}"
      >
        ${data}
      </div>
    `;
    },
  },
  {
    data: "create_time",
    title: t("AGENT_TRANSFER_CREATE_TIME"),
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
    title: t("AGENT_TRANSFER_PDF"),
    orderable: false,
    render: (_data: number, _name: string, row: AgentTransferVO) => {
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
  downloadPDFUtil("/player-transfer/pdf", { id }, "player-transfer");
};

function handleQuery() {
  setLoading(true);
  AgentTransferAPI.getAgentTransferData(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
        summaryAry.value = [
          {
            title: "AGENT_TRANSFER_TOTAL_DEPOSIT_AMOUNT",
            value: `$${summary.deposit}`,
            previous: `$${summary.deposit_previous}`,
            increase: summary.deposit_increase,
            trend: summary.deposit_trend,
            imageSrc: "poker",
          },
          {
            title: "AGENT_TRANSFER_TOTAL_WITHDRAWAL_AMOUNT",
            value: `$${summary.withdrawal}`,
            previous: `$${summary.withdrawal_previous}`,
            increase: summary.withdrawal_increase,
            trend: summary.withdrawal_trend,
            imageSrc: "poker2",
          },
          {
            title: "AGENT_TRANSFER_TOTAL_DEPOSIT_COUNT",
            value: summary.deposit_count,
            previous: summary.deposit_count_previous,
            increase: summary.deposit_count_increase,
            trend: summary.deposit_count_trend,
            imageSrc: "poker",
          },
          {
            title: "AGENT_TRANSFER_TOTAL_WITHDRAWAL_COUNT",
            value: summary.withdrawal_count,
            previous: summary.withdrawal_count_previous,
            increase: summary.withdrawal_count_increase,
            trend: summary.withdrawal_count_trend,
            imageSrc: "poker2",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_AGENT_DEPOSIT_WITHDRAWAL_RECORD");
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
