<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="GAME_SERVER_STATUS"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <el-button
          v-can="'game_server_shutdown'"
          type="danger"
          class="rounded-full h-[40px] px-6 py-3 text-sm"
          @click="showDialog(false)"
        >
          {{ $t("BUTTON_SERVER_CLOSE") }}
        </el-button>
        <el-button
          type="primary"
          class="rounded-full h-[40px] px-6 py-3 text-sm"
          @click="showDialog(true)"
        >
          {{ $t("BUTTON_SERVER_CANCEL_SHOUT_DOWN") }}
        </el-button>
        <span class="text-sm mx-2 text-[#cccccc]">{{ scheduled_shutdown_time_msg }}</span>
      </template>
      <template #searchFilter>
        <el-select
          v-model="serverId"
          :placeholder="$t('GAME_SERVER_STATUS_SERVER_NAME')"
          :clearable="true"
          size="large"
          class="min-w-[220px]!"
        >
          <el-option v-for="item in gameModes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-select
          v-model="gameId"
          :placeholder="$t('GAME_SERVER_STATUS_GAME_NAME')"
          :clearable="true"
          size="large"
          class="min-w-[220px]!"
        >
          <el-option
            v-for="item in games"
            :key="item.id"
            :label="`${item.name}`"
            :value="item.id"
          />
        </el-select>

        <div class="flex space-x-2">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>
  <GameServerStatusDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isCancel="isCancel"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import GameServerStatusAPI, {
  GameServerStatusPageQuery,
  GameServerStatusVO,
} from "@/api/game_server_status.api";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
const scheduled_shutdown_time_msg = ref("");
const dialogVisible = ref(false);
const dialogTitle = ref("");
const closeDialog = (_reQuery: boolean = false) => {
  dialogVisible.value = false;
  handleQuery();
};

const { t, locale } = useI18n();
const { setLoading } = useLoadingStore();
const total = ref(0);
const isCancel = ref(false);
const dataAry = ref<GameServerStatusVO[]>([] as GameServerStatusVO[]);
const gameModes = ref<EnumVO[]>([] as EnumVO[]);
const games = ref<EnumVO[]>([] as EnumVO[]);
const queryParams = reactive<GameServerStatusPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  game_id: null,
  server_id: null,
});

const showDialog = (cancel: boolean) => {
  isCancel.value = cancel;
  dialogTitle.value = t(`${cancel ? "BUTTON_SERVER_CANCEL_SHOUT_DOWN" : "BUTTON_SERVER_CLOSE"}`);
  dialogVisible.value = true;
};

const resetSearch = () => {
  Object.assign(queryParams, {
    game_id: "",
    server_id: "",
  });
};

const formData = ref({
  shutdown_time: `${dayjs().add(1, "day").startOf("day").format("YYYY-MM-DDTHH:mm:ss")}`,
  password: "",
});

const serverId = computed({
  get: () => {
    return queryParams.server_id ?? "";
  },
  set: (newValue) => {
    queryParams.server_id = newValue;
  },
});

const gameId = computed({
  get: () => {
    return queryParams.game_id ?? "";
  },
  set: (newValue) => {
    queryParams.game_id = newValue;
  },
});

// 初始化 form
const resetForm = () => {};

// 更新語系
watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

// 更新 DataTable
const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

// DataTable 欄位定義
const getColumns = () => [
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "game_id", title: t("GAME_SERVER_STATUS_GAME_ID") },
  { data: "server_id", title: t("GAME_SERVER_STATUS_SERVER_ID") },
  { data: "game_name", title: t("GAME_SERVER_STATUS_GAME_NAME") },
  { data: "server_name", title: t("GAME_SERVER_STATUS_SERVER_NAME") },
  { data: "power_fl", title: t("GAME_SERVER_STATUS_POWER_FL") },
  { data: "login_fl", title: t("GAME_SERVER_STATUS_LOGIN_FL") },
  {
    data: "create_time",
    title: t("GAME_SERVER_STATUS_CREATE_TIME"),
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
    data: "update_time",
    title: t("GAME_SERVER_STATUS_UPDATE_TIME"),
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

// DataTableQuery
const handleQuery = () => {
  setLoading(true);
  GameServerStatusAPI.get({
    ...queryParams,
  })
    .then(({ result, data, records_total, scheduled_shutdown_time }) => {
      if (result) {
        dataAry.value =
          data?.map((e) => ({
            ...e,
            id: e.server_id,
          })) ?? [];
        total.value = records_total;
        scheduled_shutdown_time_msg.value = scheduled_shutdown_time;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_GAME_SERVER_STATUS");
    })
    .finally(() => {
      setLoading(false);
    });
};

// 初始化資料
const getInitialData = async () => {
  setLoading(true);
  try {
    const [gamesOptions, gameMode] = await Promise.all([
      EnumAPI.get("GameId"),
      EnumAPI.get("ServerId"),
    ]);

    games.value = gamesOptions;
    gameModes.value = gameMode;
  } catch {
    getDataErrorAlert(t, "PAGE_GAME_SERVER_STATUS");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  getInitialData();
  handleQuery();
});
</script>
