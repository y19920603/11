<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="TABLE_DATA_MANAGEMENT"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
      @editHandler="handleEdit"
      @deleteHandler="handleDelete"
      @refresh="handleQuery"
    >
      <template #dateFilter>
        <AddNewItem
          :btnName="`${t('BUTTON_CREATE')}`"
          :permissionName="'table_management_create'"
          @add="addNewItem"
        >
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>
      <template #searchFilter>
        <el-select
          v-model="serverId"
          :placeholder="$t('GAME_SERVER_STATUS_SERVER_NAME')"
          :clearable="true"
          size="large"
          class="min-w-[230px]!"
        >
          <el-option v-for="item in gameModes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-popover
          class="box-item"
          :width="220"
          :content="$t('TABLE_LIST_SEARCH')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="h-[40px]! min-w-[220px]"
              size="large"
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
  <TableDataManagementDialog
    v-show="dialogVisible"
    v-model:visible="dialogVisible"
    :title="dialogTitle"
    :isEdit="isEdit"
    :editData="originalFormData"
    :gameTypeModes="gameModes"
    :ruleLevels="ruleLevels"
    @handleCloseDialog="closeDialog"
    @refresh="handleQuery"
  />
</template>
<script setup lang="ts">
import {
  getTableList,
  getTableRecord,
  deleteTable,
  syncTableList,
} from "@/api/table_data_management.api";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { ServerIdEnum } from "@/enums/games/serverId.enum";
import type {
  TableListVO,
  UpdateTableFromParam,
  TableListPageQuery,
} from "@/api/table_data_management.api";
import { checkSyncStatus } from "@/api/table_data_management.api";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateTableFromParam | null>(null);
const closeDialog = (reQuery: boolean = false) => {
  originalFormData.value = null;
  dialogVisible.value = false;
  if (reQuery) {
    handleQuery();
  }
};

const { t, locale } = useI18n();
const { setLoading } = useLoadingStore();
const gameModes = ref<EnumVO[]>([] as EnumVO[]);
const ruleLevels = ref<EnumVO[]>([] as EnumVO[]);
const isEdit = ref(false);

// formData
const formData = ref<UpdateTableFromParam>(getEmptyFormData());
function getEmptyFormData(): UpdateTableFromParam {
  return {
    id: null,
    server_id: "",
    min_player: 2,
    max_player: 6,
    wait_buy_ev_sec: "",
    rake: 5,
    max_rake_gold: "",
    max_rake_gold4: "",
    min_buy_gold: "",
    max_buy_gold: "",
    time_bank_sec: "",
    time_bank_diamond: "",
    sb_gold: "",
    bb_gold: "",
    ante_gold: "",
    wait_bet_sec: "",
    winner_need_play_sec: "",
    rule_lv: 0,
    dead_chip_fl: true,
    ev_fl: true,
    rake_limit_fl: true,
    ip_check_fl: true,
    mi_card_fl: true,
    multi_dealt_fl: true,
    rabbiting_fl: true,
    straddle_fl: true,
    win_rate_fl: true,
    time_bank_fl: true,
    emoji_fl: true,
    self_flop_fl: true,
    chat_fl: true,
    auto_buy_fl: true,
    auto_join_fl: true,
    test_fl: true,
    table_open_number: "",
    sea_fl: true,
    rule_id: "",
  };
}

// 根據 server id 初始化開關
const defaultCheck: Record<number, string[]> = {
  [ServerIdEnum.NLH]: ["test_fl"],
  [ServerIdEnum.SIX_PLUS]: ["test_fl"],
  [ServerIdEnum.PLO]: ["test_fl"],
  [ServerIdEnum.AOF_NLH]: ["ev_fl", "rake_limit_fl", "test_fl"],
  [ServerIdEnum.AOF_PLO]: ["ev_fl", "rake_limit_fl", "test_fl"],
  [ServerIdEnum.TEST_NLH]: [
    "ev_fl",
    "rake_limit_fl",
    "rabbiting_fl",
    "straddle_fl",
    "time_bank_fl",
    "test_fl",
  ],
  [ServerIdEnum.TEST_SIX_PLUS]: [
    "ev_fl",
    "rake_limit_fl",
    "rabbiting_fl",
    "straddle_fl",
    "time_bank_fl",
    "test_fl",
  ],
  [ServerIdEnum.TEST_PLO]: [
    "ev_fl",
    "rake_limit_fl",
    "rabbiting_fl",
    "straddle_fl",
    "time_bank_fl",
    "test_fl",
  ],
  [ServerIdEnum.TEST_AOF_NLH]: ["ev_fl", "rake_limit_fl", "test_fl"],
  [ServerIdEnum.TEST_AOF_PLO]: ["ev_fl", "rake_limit_fl", "test_fl"],
};
watch(
  () => formData.value.server_id,
  (newValue) => {
    if (originalFormData.value === null && newValue) {
      Object.assign(formData.value, {
        dead_chip_fl: true,
        ev_fl: true,
        rake_limit_fl: true,
        ip_check_fl: true,
        mi_card_fl: true,
        multi_dealt_fl: true,
        rabbiting_fl: true,
        straddle_fl: true,
        win_rate_fl: true,
        time_bank_fl: true,
        emoji_fl: true,
        self_flop_fl: true,
        chat_fl: true,
        auto_buy_fl: true,
        auto_join_fl: true,
        test_fl: true,
      });
      const selectedDefaults = defaultCheck[Number(newValue)];
      if (selectedDefaults?.length) {
        selectedDefaults.forEach((key) => {
          (formData.value as any)[key] = false;
        });
      }

      formData.value.max_player = [
        ServerIdEnum.AOF_NLH,
        ServerIdEnum.AOF_PLO,
        ServerIdEnum.TEST_AOF_NLH,
        ServerIdEnum.TEST_AOF_PLO,
      ].includes(Number(newValue))
        ? 4
        : 6;
    }
  },
  { immediate: true }
);

// 新增按鈕
const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("TABLE_LIST_DIALOG_TITLE"),
  });
  dialogVisible.value = true;
};

// 初始化 form
const resetForm = () => {
  if (isEdit.value && originalFormData.value) {
    formData.value = Object.assign(
      formData.value,
      JSON.parse(JSON.stringify(originalFormData.value))
    );
  } else {
    formData.value = getEmptyFormData();
  }

  nextTick(() => {
    setTimeout(() => {
      formData.value.server_id = gameModes.value.at(0)?.id ?? "";
    }, 0);
  });
};

// 更新語系
watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const total = ref(0);
const dataAry = ref<TableListVO[]>([]);
const queryParams = reactive<TableListPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  server_id: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: "",
    server_id: null,
  });
};

const serverId = computed({
  get: () => {
    return queryParams.server_id ?? "";
  },
  set: (newValue) => {
    queryParams.server_id = newValue as number;
  },
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
  { data: "table_id", title: t("TABLE_LIST_NUMBER"), className: "text-left!" },
  {
    data: "agent_name",
    title: t("TABLE_LIST_AGENT_NAME"),
    className: "text-left!",
  },
  // { data: "server_id", title: t("TABLE_LIST_SERVER_ID"), className: "text-left!" },
  // { data: "server_name", title: t("TABLE_LIST_SERVER_NAME"), sortable: false },
  // { data: "server_name_en", title: t("TABLE_LIST_SERVER_NAME_EN"), sortable: false },
  {
    title: t("TABLE_LIST_SERVER_NAME"),
    data: "server_id", // 或保留作 key
    render: (_: any, __: string, row: any) => {
      return `${row.server_name} (${row.server_name_en})`;
    },
  },
  // { data: "rule_id", title: t("TABLE_LIST_RULE_ID"), className: "text-left!" },
  {
    data: "rule_lv",
    title: t("TABLE_LIST_RULE_LV"),
    render: (_data: number, _name: string, _row: TableListVO) => _row.rule_lv_name,
  },
  { data: "ante_gold", title: t("TABLE_LIST_ANTE_GOLD") },
  { data: "sb_gold", title: t("TABLE_LIST_SB_GOLD") },
  { data: "bb_gold", title: t("TABLE_LIST_BB_GOLD") },
  { data: "min_buy_gold", title: t("TABLE_LIST_MIN_BUY_GOLD") },
  { data: "max_buy_gold", title: t("TABLE_LIST_MAX_BUY_GOLD") },
  { data: "rake", title: t("TABLE_LIST_RAKE") },
  { data: "max_rake_gold", title: t("TABLE_LIST_MAX_RAKE_GOLD") },
  { data: "max_rake_gold4", title: t("TABLE_LIST_MAX_RAKE_GOLD4") },
  { data: "min_player", title: t("TABLE_LIST_MIN_PLAYER") },
  { data: "max_player", title: t("TABLE_LIST_MAX_PLAYER") },
  // { data: "time_bank_sec", title: t("TABLE_LIST_TIME_BANK_SEC") },
  // { data: "time_bank_diamond", title: t("TABLE_LIST_TIME_BANK_DIAMOND") },
  {
    data: "ev_fl",
    title: t("TABLE_LIST_EV_FL"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: TableListVO) => {
      return `
      <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
        ${_row.ev_fl_name}
      </div>
    `;
    },
  },

  {
    data: "ip_check_fl",
    title: t("TABLE_LIST_IP_CHECK_FL"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: TableListVO) => {
      return `
      <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
        ${_row.ip_check_fl_name}
      </div>
    `;
    },
  },

  {
    data: "del_fl",
    title: t("TABLE_LIST_DEL_FL"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: TableListVO) => {
      return `
      <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
        ${_row.del_fl_name}
      </div>
    `;
    },
  },

  {
    data: "create_time",
    title: t("TABLE_LIST_CREATE_TIME"),
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
    title: t("TABLE_LIST_UPDATE_TIME"),
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
    title: t("TABLE_LIST_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: number, _name: string, row: TableListVO) => {
      return row.del_fl
        ? ""
        : `<div class="action-buttons" data-id="${row.id}" data-field="server_name,table_id"></div>`;
    },
  },
];
const columns = ref(getColumns());

// DataTableQuery
function handleQuery() {
  setLoading(true);
  checkSync();

  const params = {
    ...queryParams,
    server_id: queryParams.server_id ?? undefined, // 不傳 null
    search: queryParams.search ?? "", // 預設空字串
  };

  getTableList(params)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ?? [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_TABLE_DATA_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });

  console.log("123");
}

// 編輯按鈕
const handleEdit = (model: TableListVO) => {
  setLoading(true);
  getTableRecord(model.id)
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(
          `${t("MSG_GET_DATA_FAIL", { page: `${model.id}(${model.rule_id})` })}, message: ${msg}`,
          { confirmButtonText: t("BUTTON_CONFIRM") }
        );
        return;
      } else {
        // 直接存整包，給 Dialog 用
        originalFormData.value = JSON.parse(JSON.stringify(data[0]));
        isEdit.value = true;
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("TABLE_LIST_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.id}(${model.rule_id})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  deleteTable(data.id)
    .then(({ result, msg }) => {
      actionResultAlert(t, result, msg, "BUTTON_DELETE");
      handleQuery();
    })
    .catch(() => {
      actionErrorAlert(t, "BUTTON_DELETE");
    })
    .finally(() => {
      setLoading(false);
    });
};

// 同步按鈕
const asyncData = () => {
  setLoading(true);
  syncTableList()
    .then(({ result, msg }) => {
      actionResultAlert(t, result, msg, "BUTTON_SYNC");
      checkSync();
    })
    .catch(() => {
      actionErrorAlert(t, "BUTTON_SYNC");
    })
    .finally(() => {
      setLoading(false);
    });
};

// 檢查同步
const async = ref(true);
const asyncMsg = ref("");
function checkSync() {
  setLoading(true);
  checkSyncStatus()
    .then(({ result, msg }) => {
      async.value = result;
      asyncMsg.value = msg;
    })
    .catch(() => {
      async.value = false;
      asyncMsg.value = "同步狀態檢查失敗";
    })
    .finally(() => {
      setLoading(false);
    });
}

// 初始化資料
const getInitialData = async () => {
  setLoading(true);
  try {
    const [serverIds, ruleLevel] = await Promise.all([
      EnumAPI.get("ServerId"),
      EnumAPI.get("RuleLevel"),
    ]);
    gameModes.value = serverIds.filter((e) => e.id !== 0);
    ruleLevels.value = ruleLevel;
  } catch {
    getDataErrorAlert(t, "PAGE_TABLE_DATA_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  handleQuery();
  getInitialData();
});
</script>
<style lang="scss">
.centered-select {
  .el-select__wrapper {
    text-align: center;
  }
}
</style>
