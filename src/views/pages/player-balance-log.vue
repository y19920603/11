<template>
  <PageTitle title="PLAYER_BALANCE_LOG"></PageTitle>

  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <div class="font-bold text-xl my-2">
          {{ $t("PLAYER_MEMBER_MANAGEMENT_CLIENT_UID") }}: {{ id }}
        </div>
        <div class="flex items-center justify-center space-x-2">
          <div class="justify-center items-center flex cursor-pointer" @click="() => router.back()">
            <el-icon size="24"><Back /></el-icon>
          </div>
          <DateTimeFilter
            :startDateTime="queryParams.start_datetime"
            :endDateTime="queryParams.end_datetime"
            :dateMode="queryParams.date_mode"
            @updateDateTime="updateDataTable"
          />
        </div>
      </template>
      <template #searchFilter>
        <div
          class="space-y-2 items-center xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-11 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-select
              v-model="causeType"
              :placeholder="$t('PLAYER_EXCHANGE_RECORD_CAUSE_TEXT')"
              :clearable="true"
            >
              <el-option
                v-for="item in causeCategorys"
                :key="item.cause"
                :label="item.cause_text"
                :value="item.cause"
              />
            </el-select>
            <el-select
              v-model="goldType"
              :placeholder="$t('PLAYER_EXCHANGE_RECORD_GOLD_TYPE')"
              :clearable="true"
            >
              <el-option
                v-for="item in goldTypes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
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

import PlayerBalanceLogAPI, {
  PlayerBalanceLogPageQuery,
  PlayerBalanceLogVO,
} from "@/api/player_balance_log.api";
import PlayerExchangeRecordAPI, { CauseCategoryVO } from "@/api/player_exchange_record.api";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import getGoldImg from "@/utils/goldImg";

const { t, locale } = useI18n();
const route = useRoute();
const id = route.params.id as string;

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const router = useRouter();

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<PlayerBalanceLogVO[]>([] as PlayerBalanceLogVO[]);
const causeCategorys = ref<CauseCategoryVO[]>([] as CauseCategoryVO[]);
const goldTypes = ref<EnumVO[]>([] as EnumVO[]);
const queryParams = reactive<PlayerBalanceLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  client_uid: id,
  cause: null,
  gold_type: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    cause: null,
    gold_type: null,
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
  { data: "cause_name", title: t("PLAYER_BALANCE_LOG_CAUSE_TEXT") },
  {
    data: "gold_type",
    title: t("PLAYER_BALANCE_LOG_GOLD_TYPE"),
    className: "text-center!",
    render: (data: number, _name: string, row: PlayerBalanceLogVO) => {
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
  { data: "gold_old", title: t("PLAYER_BALANCE_LOG_GOLD_OLD") },
  {
    data: "gold_add",
    title: t("PLAYER_EXCHANGE_RECORD_GOLD_ADD"),
    render: (data: string) =>
      `<span class="${parseFloat(data) > 0 ? "text-[#59AFFF]" : "text-[#F46A6A]"}">${data}</span>`,
  },
  { data: "gold_new", title: t("PLAYER_BALANCE_LOG_GOLD_NEW") },
  {
    data: "status_name",
    title: t("PLAYER_BALANCE_LOG_STATUS"),
    className: "text-center!", // 讓表格這欄置中
    render: (data: number, _name: string, row: PlayerBalanceLogVO) => {
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
    title: t("PLAYER_BALANCE_LOG_CREATE_TIME"),
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
  PlayerBalanceLogAPI.get(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_BALANCE_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}

const getCauseCategorys = () => {
  setLoading(true);

  PlayerExchangeRecordAPI.getCauseCategory()
    .then((res) => {
      causeCategorys.value = res;
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_BALANCE_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
};

const getGoldTypes = () => {
  setLoading(true);

  EnumAPI.get("GoldType")
    .then((res) => {
      goldTypes.value = res;
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_BALANCE_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
};

onMounted(() => {
  handleQuery();
  getCauseCategorys();
  getGoldTypes();
});
</script>
