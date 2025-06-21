<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="TABLE_PROFIT_LOG"></PageTitle>
  <div class="py-4 px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <template v-for="(item, index) of summaryAry" :key="index">
        <div
          class="flex py-4 px-8 rounded-xl m-4 flex-col"
          :style="{
            backgroundImage: settingsStore.theme === ThemeMode.DARK ? `url(${bgImage})` : ``,
          }"
          :class="{
            'border-2 rounded-lg border-[#eee] shadow-md': settingsStore.theme === ThemeMode.LIGHT,
          }"
        >
          <div class="flex justify-center items-center md:items-start flex-col-reverse md:flex-row">
            <div
              class="flex flex-col justify-center items-center mt-2 md:items-start text-[#ADB5BD] text-base"
            >
              <div class="text-sm">{{ $t(item.title) }}</div>
              <div class="text-white font-bold">{{ item.value }}</div>
            </div>
            <div class="flex-1"></div>
            <div class="w-[100px] h-[80px]">
              <div
                class="w-[100px] h-[80px] bg-no-repeat bg-center bg-contain"
                :style="{ backgroundImage: `url('${getSummaryImg(item.img)}')` }"
              ></div>
            </div>
          </div>
          <div class="text-sm flex">
            <div class="flex flex-col flex-1 items-center md:items-start">
              <span class="text-[#43b38c]">{{ $t("SEA_TYPE_PUBLIC") }}</span>
              <span class="text-[#aeb5bd]">{{ item.public }}</span>
            </div>
            <div class="flex flex-col flex-1 items-center md:items-start">
              <span class="text-[#676cd5]">{{ $t("SEA_TYPE_PRIVATE") }}</span>
              <span class="text-[#aeb5bd]">{{ item.private }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
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
        <DateFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          @updateDateTime="updateDataTable"
        />
      </template>
      <template #searchFilter>
        <div
          class="space-y-2 items-center xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-11 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-select
              v-model="isPublic"
              :placeholder="$t('TABLE_PROFIT_LOG_IS_PUBLIC')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in isPublicTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-model="seaType"
              :placeholder="$t('TABLE_PROFIT_LOG_SEA_TYPE')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in seaTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select
              v-model="ruleLv"
              :placeholder="$t('TABLE_PROFIT_LOG_RULE_LV')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in ruleLvTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-select
              v-model="serverId"
              :placeholder="$t('TABLE_PROFIT_LOG_GAME_NICKNAME')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in gameModes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-popover
              class="box-item"
              :width="220"
              :content="$t('TABLE_PROFIT_LOG_SEARCH_POPOVER_CONTENT')"
              placement="top-start"
              trigger="click"
            >
              <template #reference>
                <el-input
                  v-model="queryParams.search"
                  class="min-w-[220px]! h-[40px]!"
                  :placeholder="$t('AGENT_PROFIT_KEY_SEARCH_PLACEHOLDER')"
                ></el-input>
              </template>
            </el-popover>
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
import bgImage from "@/assets/dashboards/bg.png";

import TableProfitLogAPI, {
  TableProfitLogPageQuery,
  TableProfitLogVO,
  SummaryItemVO,
} from "@/api/table_profit_log.api";

import { getDataErrorAlert } from "@/utils/message";
import { useTableTypes } from "@/utils/tableTypes";
import { useSeaTypes } from "@/utils/seaTypes";
import { useLevelTypes } from "@/utils/levelTypes";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import getGoldImg from "@/utils/goldImg";
import getSummaryImg from "@/utils/summaryImg";

import { useSettingsStore } from "@/store";
import { ThemeMode } from "@/enums/settings/theme.enum";

const settingsStore = useSettingsStore();

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  isPublicTypes.value = useTableTypes(t);
  seaTypes.value = useSeaTypes(t);
  ruleLvTypes.value = useLevelTypes(t);
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const gameModes = ref<EnumVO[]>([] as EnumVO[]);
const dataAry = ref<TableProfitLogVO[]>([] as TableProfitLogVO[]);
const queryParams = reactive<TableProfitLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  is_public: null,
  sea_type: null,
  rule_lv: null,
  server_id: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: null,
    is_public: null,
    sea_type: null,
    rule_lv: null,
    server_id: null,
  });
};

const isPublic = computed({
  get: () => {
    return queryParams.is_public ?? "";
  },
  set: (newValue) => {
    queryParams.is_public = newValue;
  },
});

const isPublicTypes = ref(useTableTypes(t));

const seaType = computed({
  get: () => {
    return queryParams.sea_type ?? "";
  },
  set: (newValue) => {
    queryParams.sea_type = newValue;
  },
});

const seaTypes = ref(useSeaTypes(t));

const ruleLv = computed({
  get: () => {
    return queryParams.rule_lv ?? "";
  },
  set: (newValue) => {
    queryParams.rule_lv = newValue;
  },
});

const ruleLvTypes = ref(useLevelTypes(t));

const serverId = computed({
  get: () => {
    return queryParams.server_id ?? "";
  },
  set: (newValue) => {
    queryParams.server_id = newValue;
  },
});

const getGameModes = () => {
  setLoading(true);

  EnumAPI.get("ServerId")
    .then((res) => {
      gameModes.value = res.filter((item) => item.id !== 0);
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_TABLE_PROFIT_LOG");
    })
    .finally(() => {
      setLoading(false);
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
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "table_id", title: t("TABLE_PROFIT_LOG_TABLE_ID"), className: "text-left!" },
  { data: "agent_name", title: t("TABLE_PROFIT_LOG_AGENT_NAME") },
  { data: "game_nickname", title: t("TABLE_PROFIT_LOG_GAME_NICKNAME") },
  { data: "max_player", title: t("TABLE_PROFIT_LOG_MAX_PLAYER") },
  {
    data: "ante_gold",
    title: t("TABLE_PROFIT_LOG_ANTE_GOLD"),
    className: "text-right!",
    render: (data: string, _name: string, row: TableProfitLogVO) =>
      data === "0.0000" ? `$${row.sb_gold}/${row.bb_gold}` : data,
  },
  {
    data: "min_buy_gold",
    title: t("TABLE_PROFIT_LOG_BUY_GOLD"),
    className: "text-right!",
    render: (data: number, _name: string, row: TableProfitLogVO) =>
      `$${row.min_buy_gold}-${row.max_buy_gold}`,
  },
  {
    data: "gold_type",
    title: t("GA_PROFIT_GOLD_TYPE"),
    className: "text-center!",
    render: (data: number, _name: string, row: TableProfitLogVO) => {
      let html = "";
      switch (data) {
        case 0:
        case 1:
        case 2:
        case 3:
          html = `<div class="text-center"><img src="${getGoldImg(data.toString())}" alt="" height="35px" width="35px" />
                    <div>${row.currency ?? ""}</div></div>`;
          break;
        default:
          html = `<div class="text-center">${data}</div>`;
          break;
      }
      return html;
    },
  },
  {
    data: "rule_lv",
    title: t("TABLE_PROFIT_LOG_RULE_LV"),
    className: "text-left!",
    render: (data: number, _name: string, row: TableProfitLogVO) => row.rule_lv_name ?? "",
  },
  {
    data: "sea_type",
    title: t("TABLE_PROFIT_LOG_SEA_TYPE"),
    className: "text-left!",
    render: (data: number, _name: string, row: TableProfitLogVO) => row.sea_type_name ?? "",
  },
  {
    data: "is_public",
    title: t("TABLE_PROFIT_LOG_IS_PUBLIC"),
    className: "text-left!",
    render: (data: number, _name: string, row: TableProfitLogVO) => row.table_type_name ?? "",
  },
  {
    data: "create_time",
    title: t("TABLE_PROFIT_LOG_CREATE_TIME"),
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
          <span>${date[0]}</span>
          <span>${date[1]}</span>
        </div>`;
    },
  },
  {
    data: "rake",
    title: t("TABLE_PROFIT_LOG_RAKE"),
    className: "text-right!",
  },
  { data: "round_count", title: t("TABLE_PROFIT_LOG_ROUND_COUNT") },
  {
    data: "pots_all_gold",
    title: t("TABLE_PROFIT_LOG_POTS_ALL_GOLD"),
    className: "text-right!",
    render: (data: number) => `$${data}`,
  },
  {
    data: "rake_gold",
    title: t("TABLE_PROFIT_LOG_RAKE_GOLD"),
    className: "text-right!",
    render: (data: number) => `$${data}`,
  },
  {
    data: "agent_split_gold",
    title: t("TABLE_PROFIT_LOG_AGENT_SPLIT_GOLD"),
    className: "text-right!",
    render: (data: number) => `$${data}`,
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  TableProfitLogAPI.get(queryParams)
    .then(({ result, data, summary, records_total }) => {
      if (result) {
        dataAry.value = data.map((e) => ({ ...e, id: e.table_id }));
        total.value = records_total;
        summaryAry.value = [
          {
            title: "TABLE_PROFIT_LOG_TOTAL_TABLES",
            value: summary.total_number_of_tables,
            public: summary.public_tables,
            private: summary.private_tables,
            img: "table_profit_1",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_NLH_TABLES",
            value: summary.total_number_of_nlh_tables,
            public: summary.public_nlh_tables,
            private: summary.private_nlh_tables,
            img: "table-profit_green",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_6_PLUS_TABLES",
            value: summary.total_number_of_six_tables,
            public: summary.public_six_tables,
            private: summary.private_six_tables,
            img: "table_profit_red",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_PLO_TABLES",
            value: summary.total_number_of_plo_tables,
            public: summary.public_plo_tables,
            private: summary.private_plo_tables,
            img: "table_profit_purple",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_TABLE_BET_AMOUNT",
            value: `$${summary.total_betting_amount}`,
            public: `$${summary.public_amount}`,
            private: `$${summary.private_amount}`,
            img: "table_profit_1",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_NLH_BET_AMOUNT",
            value: `$${summary.total_betting_nlh_amount}`,
            public: `$${summary.public_nlh_amount}`,
            private: `$${summary.private_nlh_amount}`,
            img: "table_profit_2",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_6_PLUS_BET_AMOUNT",
            value: `$${summary.total_betting_six_amount}`,
            public: `$${summary.public_six_amount}`,
            private: `$${summary.private_six_amount}`,
            img: "table_profit_3",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_PLO_BET_AMOUNT",
            value: `$${summary.total_betting_plo_amount}`,
            public: `$${summary.public_plo_amount}`,
            private: `$${summary.private_plo_amount}`,
            img: "table_profit_4",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_AOF_NLH_TABLES",
            value: summary.total_number_of_aof_nlh_tables,
            public: summary.public_aof_nlh_tables,
            private: summary.private_aof_nlh_tables,
            img: "table_profit_purple",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_AOF_PLO_TABLES",
            value: summary.total_number_of_aof_plo_tables,
            public: summary.public_aof_plo_tables,
            private: summary.private_aof_plo_tables,
            img: "table_profit_purple",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_AOF_NLH_BET_AMOUNT",
            value: `$${summary.total_betting_aof_nlh_amount}`,
            public: `$${summary.public_aof_nlh_amount}`,
            private: `$${summary.private_aof_nlh_amount}`,
            img: "table_profit_3",
          },
          {
            title: "TABLE_PROFIT_LOG_TOTAL_AOF_PLO_BET_AMOUNT",
            value: `$${summary.total_betting_aof_plo_amount}`,
            public: `$${summary.public_aof_plo_amount}`,
            private: `$${summary.private_aof_plo_amount}`,
            img: "table_profit_3",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_TABLE_PROFIT_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(() => {
  handleQuery();
  getGameModes();
});
</script>
