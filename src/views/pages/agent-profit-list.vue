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
    <DataTable :rowData="agentProfit" :columns="columns">
      <Column selectionMode="multiple"></Column>
      <Column field="ga_name" :header="$t('AGENT_PROFIT_GA_NAME')" sortable />
      <Column field="ga_company_name" :header="$t('AGENT_PROFIT_GA_COMPANY_NAME')" sortable />
      <Column field="agent_name" :header="$t('AGENT_PROFIT_AGENT_NAME')" sortable />
      <Column field="company_name" :header="$t('AGENT_PROFIT_COMPANY_NAME')" sortable />
      <Column field="round_id" :header="$t('AGENT_PROFIT_ROUND_ID')" sortable />
      <Column field="account" :header="$t('AGENT_PROFIT_ACCOUNT')" sortable />
      <Column
        field="split_gold"
        :header="$t('AGENT_PROFIT_SPLIT_GOLD')"
        sortable
        class="text-right!"
      />
      <Column
        field="income_split"
        :header="$t('AGENT_PROFIT_INCOME_SPLIT')"
        sortable
        class="text-right!"
      />
      <Column field="income_type" :header="$t('AGENT_PROFIT_INCOME_TYPE')" sortable />
      <Column
        field="agent_split_gold"
        :header="$t('AGENT_PROFIT_AGENT_SPLIT_GOLD')"
        sortable
        class="text-right!"
      >
        <template #body="slotProps">
          <span :class="parseFloat(slotProps.data.agent_split_gold) < 0 ? 'red' : 'text-[#59AFFF]'">
            {{ slotProps.data.agent_split_gold }}
          </span>
        </template>
      </Column>
      <Column
        field="agent_split_gold_del"
        :header="$t('AGENT_PROFIT_AGENT_SPLIT_GOLD_DEL')"
        sortable
        class="text-right!"
      >
        <template #body="slotProps">
          <span
            :class="
              slotProps.data.agent_split_gold_del === '--'
                ? ''
                : parseFloat(slotProps.data.agent_split_gold_del) < 0
                  ? 'red'
                  : 'text-[#59AFFF]'
            "
          >
            {{ slotProps.data.agent_split_gold_del }}
          </span>
        </template>
      </Column>
      <Column field="goldType" :header="$t('AGENT_PROFIT_GOLD_TYPE')" sortable>
        <template #body="slotProps">
          <div class="text-center" style="width: 120px">
            <template v-if="slotProps.data.gold_type === 0">
              <img :src="`/src/assets/agent/tcoin.png`" alt="" height="35px" width="35px" />
              <div>{{ $t("GOLD_TYPE_EXPERIENCE_COINS") }}</div>
            </template>
            <template v-else-if="slotProps.data.gold_type === 1">
              <img :src="`/src/assets/agent/money.png`" alt="" height="35px" width="35px" />
              <div>{{ $t("GOLD_TYPE_DOLLARS") }}</div>
            </template>
            <template v-else-if="slotProps.data.gold_type === 2">
              <img :src="`/src/assets/agent/bet_clip.png`" alt="" height="35px" width="35px" />
              <div>{{ $t("GOLD_TYPE_CHIPS") }}</div>
            </template>
            <template v-else-if="slotProps.data.gold_type === 3">
              <img :src="`/src/assets/agent/diamond.png`" alt="" height="35px" width="35px" />
              <div>{{ $t("GOLD_TYPE_DIAMONDS") }}</div>
            </template>
            <template v-else>
              <div>{{ slotProps.data.gold_type }}</div>
            </template>
          </div>
        </template>
      </Column>
      <Column field="sea_type" :header="$t('AGENT_PROFIT_SEA_TYPE')" sortable>
        <template #body="slotProps">
          <div class="text-center" v-html="getSeaTable(slotProps.data)"></div>
        </template>
      </Column>
      <Column field="settlement_status" :header="$t('AGENT_PROFIT_SETTLEMENT_STATUS')" sortable>
        <template #body="slotProps">
          <div
            v-if="slotProps.data.settlement_status === 0"
            class="rounded-full px-1 text-center"
            style="color: #666666; background-color: #cccccc"
          >
            {{ $t("SETTLEMENT_STATUS_UNSETTLED") }}
          </div>
          <div
            v-else-if="slotProps.data.settlement_status === 1"
            class="rounded-full px-1 text-center"
            style="color: #50c38e; background-color: #34494a"
          >
            {{ $t("SETTLEMENT_STATUS_SETTLED") }}
          </div>
          <div v-else>
            {{ slotProps.data.settlement_status }}
          </div>
        </template>
      </Column>
      <Column field="create_time" :header="$t('AGENT_PROFIT_CREATE_TIME')" sortable />
      <Column field="PDF" :header="$t('AGENT_PROFIT_PDF')" class="text-center!">
        <template #body="slotProps">
          <div class="text-center" @click="downloadPDF(slotProps.data.id)">
            <img :src="`/src/assets/agent/download.png`" alt="" height="35px" width="35px" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import Column from "primevue/column";
import dayjs from "dayjs";

import AgentProfitAPI, {
  AgentProfitPageQuery,
  AgentProfitVO,
  SummaryItemVO,
} from "@/api/agent_profit.api";

const { t } = useI18n();

const loading = ref(false);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const agentProfit = ref<AgentProfitVO[]>([] as AgentProfitVO[]);
const queryParams = reactive<AgentProfitPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 10,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  income_type: null,
});

const columns = [
  { value: "ga_name", header: t("AGENT_PROFIT_GA_NAME") },
  { value: "ga_company_name", header: t("AGENT_PROFIT_GA_COMPANY_NAME") },
  { value: "agent_name", header: t("AGENT_PROFIT_AGENT_NAME") },
  { value: "company_name", header: t("AGENT_PROFIT_COMPANY_NAME") },
  { value: "round_id", header: t("AGENT_PROFIT_ROUND_ID") },
  { value: "account", header: t("AGENT_PROFIT_ACCOUNT") },
  { value: "split_gold", header: t("AGENT_PROFIT_SPLIT_GOLD") },
  { value: "income_split", header: t("AGENT_PROFIT_INCOME_SPLIT") },
  { value: "income_type", header: t("AGENT_PROFIT_INCOME_TYPE") },
  { value: "agent_split_gold", header: t("AGENT_PROFIT_AGENT_SPLIT_GOLD") },
  { value: "agent_split_gold_del", header: t("AGENT_PROFIT_AGENT_SPLIT_GOLD_DEL") },
  { value: "goldType", header: t("AGENT_PROFIT_GOLD_TYPE") },
  { value: "sea_type", header: t("AGENT_PROFIT_SEA_TYPE") },
  { value: "settlement_status", header: t("AGENT_PROFIT_SETTLEMENT_STATUS") },
  { value: "create_time", header: t("AGENT_PROFIT_CREATE_TIME") },
  { value: "PDF", header: t("AGENT_PROFIT_PDF") },
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

const downloadPDF = (id: number) => {
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
    .then(({ result, data, summary }) => {
      if (result) {
        agentProfit.value = data;
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
});
</script>
