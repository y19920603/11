<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="AGENT_PROFIT"></PageTitle>
  <div class="py-4 px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <template v-for="(item, index) of summaryAry" :key="index">
        <div class="flex bg-[url('/src/assets/dashboard/bg.png')] p-8 rounded-xl m-4 flex-col">
          <div class="flex justify-center items-center flex-col-reverse md:flex-row">
            <div
              class="flex flex-col justify-center items-center mt-2 md:items-start text-[#ADB5BD] text-base"
            >
              <div>{{ $t(`AGENT_PROFIT_${item.title}`) }}</div>
              <div class="">${{ item.value }}</div>
              <div class="">
                <span v-if="labelText">{{ $t(`AGENT_PROFIT_${labelText}`) }}</span>
                ${{ item.previous }}
              </div>
            </div>
            <div class="flex-1"></div>
            <div class="w-[100px] h-[80px]">
              <div
                class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
                :style="{ backgroundImage: `url('/src/assets/agent/${item.imageSrc}.png')` }"
              ></div>
            </div>
          </div>
          <div
            class="flex space-x-2 justify-center md:justify-start"
            :class="{
              'text-[#34c38f]': item.trend === 0,
              'text-[#f46a6a]': item.trend === 1,
              'text-[#f1b44c]': item.trend === 2,
            }"
          >
            <i
              class="mdi"
              :class="{
                'mdi-arrow-up-bold': item.trend === 0,
                'mdi-arrow-down-bold': item.trend === 1,
                'mdi-minus': item.trend === 2,
              }"
            ></i>
            <div>{{ item.increase }}</div>
            <div class="text-[#ADB5BD]">{{ $t(`AGENT_PROFIT_SINCE_${labelText}`) }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
  <div class="p-8">
    <DataTable
      :rowData="agentProfit"
      :columns="columns"
      :excelApiUrl="'/agent-profit/excel'"
      :recordsTotal="total"
      @updateDataTable="updateDataTable"
    />
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import $ from "jquery";

import AgentProfitAPI, {
  AgentProfitPageQuery,
  AgentProfitVO,
  SummaryItemVO,
} from "@/api/agent_profit.api";

const { t } = useI18n();

const loading = ref(false);
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const agentProfit = ref<AgentProfitVO[]>([] as AgentProfitVO[]);
const queryParams = reactive<AgentProfitPageQuery>({
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

const updateDataTable = (data: any) => {
  Object.assign(queryParams, data);
  handleQuery();
};

const columns = [
  { data: "null" },
  { data: "ga_name", title: t("AGENT_PROFIT_GA_NAME") },
  { data: "ga_company_name", title: t("AGENT_PROFIT_GA_COMPANY_NAME") },
  { data: "agent_name", title: t("AGENT_PROFIT_AGENT_NAME") },
  { data: "company_name", title: t("AGENT_PROFIT_COMPANY_NAME") },
  { data: "round_id", title: t("AGENT_PROFIT_ROUND_ID") },
  { data: "account", title: t("AGENT_PROFIT_ACCOUNT") },
  {
    data: "split_gold",
    title: t("AGENT_PROFIT_SPLIT_GOLD"),
  },
  {
    data: "income_split",
    title: t("AGENT_PROFIT_INCOME_SPLIT"),
  },
  { data: "income_type", title: t("AGENT_PROFIT_INCOME_TYPE") },
  {
    data: "agent_split_gold",
    title: t("AGENT_PROFIT_AGENT_SPLIT_GOLD"),
    render: (data: string) => {
      return `
        <span class="${parseFloat(data) < 0 ? "red" : "text-[#59AFFF]"}">${data}</span>
      `;
    },
  },
  {
    data: "agent_split_gold_del",
    title: t("AGENT_PROFIT_AGENT_SPLIT_GOLD_DEL"),
    render: (data: string) => {
      return `
      <div class="text-right">
        ${
          data === "--"
            ? data
            : `<span class="${parseFloat(data) < 0 ? "red" : "text-[#59AFFF]"}">${data}</span>`
        }
      </div>
    `;
    },
  },
  {
    data: "gold_type",
    title: t("AGENT_PROFIT_GOLD_TYPE"),
    align: "center",
    render: (data: number) => {
      let html = "";
      switch (data) {
        case 0:
          html = `<div class="text-center"><img src="/src/assets/agent/tcoin.png" alt="" height="35px" width="35px" />
                  <div>${t("GOLD_TYPE_EXPERIENCE_COINS")}</div></div>`;
          break;
        case 1:
          html = `<div class="text-center"><img src="/src/assets/agent/money.png" alt="" height="35px" width="35px" />
                  <div>${t("GOLD_TYPE_DOLLARS")}</div></div>`;
          break;
        case 2:
          html = `<div class="text-center"><img src="/src/assets/agent/bet_clip.png" alt="" height="35px" width="35px" />
                  <div>${t("GOLD_TYPE_CHIPS")}</div></div>`;
          break;
        case 3:
          html = `<div class="text-center"><img src="/src/assets/agent/diamond.png" alt="" height="35px" width="35px" />
                  <div>${t("GOLD_TYPE_DIAMONDS")}</div></div>`;
          break;
        default:
          html = `<div class="text-center">${data}</div>`;
          break;
      }
      return html;
    },
  },
  {
    data: "sea_type",
    title: t("AGENT_PROFIT_SEA_TYPE"),
    render: (_data: number, _name: string, row: AgentProfitVO) => {
      return `<div class="text-center">${getSeaTable(row)}</div>`;
    },
  },
  {
    data: "settlement_status",
    title: t("AGENT_PROFIT_SETTLEMENT_STATUS"),
    render: (data: number) => {
      if (data === 0) {
        return `
          <div class="rounded-full px-1 text-center" style="color: #666666; background-color: #cccccc">
            ${t("SETTLEMENT_STATUS_UNSETTLED")}
          </div>
        `;
      } else if (data === 1) {
        return `
          <div class="rounded-full px-1 text-center" style="color: #50c38e; background-color: #34494a">
            ${t("SETTLEMENT_STATUS_SETTLED")}
          </div>
        `;
      } else {
        return `<div>${data}</div>`;
      }
    },
  },
  { data: "create_time", title: t("AGENT_PROFIT_CREATE_TIME") },
  {
    data: "id",
    title: t("AGENT_PROFIT_PDF"),
    orderable: false,
    render: (data: string) => {
      return `
      <div class="text-center cursor-pointer pdf_download" data-id="${data}">
        <img src="/src/assets/agent/download.png" alt="" height="35px" width="35px" />
      </div>
    `;
    },
  },
];

const getSeaTable = (row: AgentProfitVO) => {
  const getSeaText = (seaType: number, gameNickname: string): string => {
    switch (seaType) {
      case 0:
        return `${t("SEA_TYPE_PRIVATE_SEA")} / ${gameNickname}`;
      case 1:
        return `${t("SEA_TYPE_PUBLIC_SEA")} / ${gameNickname}`;
      default:
        return seaType.toString();
    }
  };

  const getTableText = (tableType: number): string => {
    switch (tableType) {
      case 0:
        return t("TABLE_TYPE_PRIVATE_TABLE");
      case 1:
        return t("TABLE_TYPE_PUBLIC_TABLE");
      default:
        return tableType.toString();
    }
  };

  const sea_text = getSeaText(row.sea_type, row.game_nickname);
  const table_text = getTableText(row.table_type);

  return `<div class="text-nowrap">${sea_text}</div><div>${table_text}</div>`;
};

const labelText = computed(() => {
  switch (queryParams.date_mode) {
    case "D":
      return "YESTERDAY";
    case "W":
      return "LAST_WEEK";
    case "M":
      return "LAST_MONTH";
    default:
      return "";
  }
});

const downloadPDF = (id: string) => {
  loading.value = true;

  AgentProfitAPI.DownloadPDF({ id })
    .then((response) => {
      const blob = new Blob([response], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `agent-profit_${id}.pdf`); // 動態設置文件名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      ElMessageBox.alert(`${t("MSG_DOWNLOAD_FAIL")}`);
      console.error("下載 PDF 失敗：", error);
    })
    .finally(() => {
      loading.value = false;
    });
};

function handleQuery() {
  loading.value = true;
  AgentProfitAPI.getAgentProfitData(queryParams)
    .then(({ result, data, summary, recordsTotal }) => {
      if (result) {
        agentProfit.value = data;
        total.value = recordsTotal;
        summaryAry.value = [
          {
            title: "PRE_REVENUE_SHARE",
            value: summary.income_gold,
            previous: summary.income_gold_previous,
            increase: summary.income_gold_increase,
            trend: summary.split_gold_trend,
            imageSrc: "poker",
          },
          {
            title: "POST_REVENUE_SHARE",
            value: summary.agent_split_gold,
            previous: summary.agent_split_gold_previous,
            increase: summary.agent_split_gold_increase,
            trend: summary.agent_split_gold_trend,
            imageSrc: "poker2",
          },
          {
            title: "AGENT_PRE_REVENUE_SHARE",
            value: summary.split_gold,
            previous: summary.split_gold_previous,
            increase: summary.split_gold_increase,
            trend: summary.split_gold_trend,
            imageSrc: "poker2",
          },
        ];
        agentProfit.value = data;
      }
    })
    .catch(() => {
      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_AGENT_PROFIT") })}`);
    })
    .finally(() => {
      loading.value = false;
    });
}
onMounted(() => {
  handleQuery();
  // eslint-disable-next-line no-unused-vars
  $("body").on("click", ".pdf_download", function (this: HTMLElement) {
    const element = this as HTMLDivElement;
    const id = $(element).data("id");
    downloadPDF(id);
  });
});
</script>
