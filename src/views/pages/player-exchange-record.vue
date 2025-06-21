<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="PLAYER_EXCHANGE_RECORD"></PageTitle>
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
        <div
          class="space-y-2 items-center xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-11 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[320px]">
            <el-select
              v-model="causeType"
              :placeholder="$t('PLAYER_EXCHANGE_RECORD_CAUSE_TEXT')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in causeCategoryAry"
                :key="item.cause"
                :label="item.cause_text"
                :value="item.cause"
              />
            </el-select>
            <el-select
              v-model="goldType"
              :placeholder="$t('PLAYER_EXCHANGE_RECORD_GOLD_TYPE')"
              :clearable="true"
              size="large"
              class="w-full md:w-[220px]!"
            >
              <el-option
                v-for="item in goldTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[320px]">
            <el-popover
              class="box-item"
              :width="220"
              :content="$t('PLAYER_EXCHANGE_RECORD_SEARCH_POPOVER_CONTENT')"
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
import PlayerExchangeRecordAPI, {
  PlayerExchangeRecordPageQuery,
  PlayerExchangeRecordVO,
  CauseCategoryVO,
} from "@/api/player_exchange_record.api";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import getGoldImg from "@/utils/goldImg";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<PlayerExchangeRecordVO[]>([] as PlayerExchangeRecordVO[]);
const causeCategoryAry = ref<CauseCategoryVO[]>([] as CauseCategoryVO[]);
const goldTypes = ref<EnumVO[]>([] as EnumVO[]);
const queryParams = reactive<PlayerExchangeRecordPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  search: null,
  cause: null,
  gold_type: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    gold_type: null,
    cause: null,
    search: null,
  });
};

const goldType = computed({
  get: () => {
    return queryParams.gold_type ?? "";
  },
  set: (newValue) => {
    queryParams.gold_type = newValue;
  },
});

const causeType = computed({
  get: () => {
    return queryParams.cause ?? "";
  },
  set: (newValue) => {
    queryParams.cause = newValue;
  },
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
  { data: "client_uid", title: t("PLAYER_EXCHANGE_RECORD_CLIENT_UID"), className: "text-left!" },
  { data: "player_nickname", title: t("PLAYER_EXCHANGE_RECORD_PLAYER_NICKNAME") },
  { data: "agent_name", title: t("PLAYER_EXCHANGE_RECORD_AGENT_NAME"), className: "text-left!" },
  {
    data: "cause",
    title: t("PLAYER_EXCHANGE_RECORD_CAUSE_TEXT"),
    className: "text-left!",
    render: (_data: number, _name: string, row: PlayerExchangeRecordVO) => row.cause_text,
  },
  { data: "cause_category", title: t("PLAYER_EXCHANGE_RECORD_CAUSE_CATEGORY") },
  {
    data: "gold_add",
    title: t("PLAYER_EXCHANGE_RECORD_GOLD_ADD"),
    render: (data: number, _name: string, row: PlayerExchangeRecordVO) =>
      `<span class="${row.gold_add_positive ? "text-[#59AFFF]" : "text-[#F46A6A]"}">${data}</span>`,
  },
  { data: "gold_old", title: t("PLAYER_EXCHANGE_RECORD_GOLD_OLD") },
  { data: "gold_new", title: t("PLAYER_EXCHANGE_RECORD_GOLD_NEW") },
  {
    data: "gold_type",
    title: t("PLAYER_EXCHANGE_RECORD_GOLD_TYPE"),
    className: "text-center!",
    render: (data: number, _name: string, row: PlayerExchangeRecordVO) => {
      let html = "";
      switch (data) {
        case 0:
        case 1:
        case 2:
        case 3:
          html = `<div class="text-center"><img src="${getGoldImg(data.toString())}" alt="" height="35px" width="35px" />
                    <div>${row.gold_type_name ?? ""}</div></div>`;
          break;
        default:
          html = `<div class="text-center">${data}</div>`;
          break;
      }
      return html;
    },
  },
  {
    data: "create_time",
    title: t("PLAYER_EXCHANGE_RECORD_CREATE_TIME"),
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
  const queryData = { ...queryParams };
  if (queryData.sort === "cause_category") {
    queryData.sort = "cause";
  }

  PlayerExchangeRecordAPI.get(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_EXCHANGE_RECORD");
    })
    .finally(() => {
      setLoading(false);
    });
}

const getInitData = () => {
  setLoading(true);

  Promise.all([PlayerExchangeRecordAPI.getCauseCategory(), EnumAPI.get("GoldType")])
    .then(([causeCategoryRes, goldTypeRes]) => {
      causeCategoryAry.value = causeCategoryRes;
      goldTypes.value = goldTypeRes;
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_EXCHANGE_RECORD");
    })
    .finally(() => {
      setLoading(false);
    });
};

onMounted(() => {
  getInitData();
  handleQuery();
});
</script>
