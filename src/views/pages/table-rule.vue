<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="TABLE_RULE"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
      @editHandler="handleEdit"
      @deleteHandler="handleDelete"
    >
      <template #dateFilter>
        <AddNewItem :btnName="`${t('BUTTON_CREATE_TABLE_RULE')}`" @add="addNewItem">
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
          :content="$t('TABLE_RULE_SEARCH_POPOVER_CONTENT')"
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
  <TableRuleDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :gameModes="gameModes"
    :ruleLevels="ruleLevels"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import TableRuleAPI, {
  TableRulePageQuery,
  TableRuleVO,
  UpdateTableRuleParam,
} from "@/api/table_rule.api";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { ServerIdEnum } from "@/enums/games/serverId.enum";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateTableRuleParam | null>(null);
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
const formData = ref<UpdateTableRuleParam>(getEmptyFormData());
function getEmptyFormData(): UpdateTableRuleParam {
  return {
    id: null,
    rule_name: null,
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
    key: t("TABLE_RULE_DIALOG_TITLE"),
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
      if (isEdit.value && originalFormData.value) {
        formData.value.server_id = originalFormData.value.server_id;
      } else {
        formData.value.server_id = gameModes.value.at(0)?.id ?? "";
      }
    }, 0);
  });
};

// 更新語系
watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const total = ref(0);
const dataAry = ref<TableRuleVO[]>([] as TableRuleVO[]);
const queryParams = reactive<TableRulePageQuery>({
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
  { data: "server_id", title: t("TABLE_RULE_SERVER_ID"), className: "text-left!" },
  { data: "server_name", title: t("TABLE_RULE_SERVER_NAME"), sortable: false },
  { data: "server_name_en", title: t("TABLE_RULE_SERVER_NAME_EN"), sortable: false },
  { data: "rule_id", title: t("TABLE_RULE_RULE_ID"), className: "text-left!" },
  { data: "rule_name", title: t("TABLE_RULE_RULE_NAME") },
  {
    data: "rule_lv",
    title: t("TABLE_RULE_RULE_LV"),
    render: (_data: number, _name: string, _row: TableRuleVO) => _row.rule_lv_name,
  },
  { data: "ante_gold", title: t("TABLE_RULE_ANTE_GOLD") },
  { data: "sb_gold", title: t("TABLE_RULE_SB_GOLD") },
  { data: "bb_gold", title: t("TABLE_RULE_BB_GOLD") },
  { data: "min_buy_gold", title: t("TABLE_RULE_MIN_BUY_GOLD") },
  { data: "max_buy_gold", title: t("TABLE_RULE_MAX_BUY_GOLD") },
  { data: "rake", title: t("TABLE_RULE_RAKE") },
  { data: "max_rake_gold", title: t("TABLE_RULE_MAX_RAKE_GOLD") },
  { data: "max_rake_gold4", title: t("TABLE_RULE_MAX_RAKE_GOLD4") },
  { data: "min_player", title: t("TABLE_RULE_MIN_PLAYER") },
  { data: "max_player", title: t("TABLE_RULE_MAX_PLAYER") },
  { data: "time_bank_sec", title: t("TABLE_RULE_TIME_BANK_SEC") },
  { data: "time_bank_diamond", title: t("TABLE_RULE_TIME_BANK_DIAMOND") },
  {
    data: "del_fl",
    title: t("TABLE_RULE_DEL_FL"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: TableRuleVO) => {
      return `
            <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
              ${_row.del_fl_name}
            </div>
          `;
    },
  },
  {
    data: "create_time",
    title: t("TABLE_RULE_CREATE_TIME"),
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
    title: t("TABLE_RULE_UPDATE_TIME"),
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
    title: t("TABLE_RULE_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: number, _name: string, row: TableRuleVO) => {
      return row.del_fl
        ? ""
        : `<div class="action-buttons" data-id="${row.id}" data-field="rule_name"></div>`;
    },
  },
];
const columns = ref(getColumns());

// DataTableQuery
function handleQuery() {
  setLoading(true);
  checkSync();
  TableRuleAPI.getAll(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ?? [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_TABLE_RULE");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: TableRuleVO) => {
  setLoading(true);
  TableRuleAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(
          `${t("MSG_GET_DATA_FAIL", { page: `${model.id}(${model.rule_name})` })}, message: ${msg}`,
          {
            confirmButtonText: t("BUTTON_CONFIRM"),
          }
        );
        return;
      } else {
        originalFormData.value = JSON.parse(JSON.stringify(data[0]));
        isEdit.value = true;
        resetForm();
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("TABLE_RULE_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.id}(${model.rule_name})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  TableRuleAPI.delete({ id: data.id })
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
  TableRuleAPI.sync()
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
  TableRuleAPI.checkSync()
    .then(({ result, msg }) => {
      async.value = result;
      asyncMsg.value = msg;
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
    getDataErrorAlert(t, "PAGE_TABLE_RULE");
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
