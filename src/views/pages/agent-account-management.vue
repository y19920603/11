<!-- eslint-disable no-unused-vars -->
<template>
  <!-- 頁面標題元件 -->
  <PageTitle title="AGENT_ACCOUNT_MANAGEMENT"></PageTitle>
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
      <!-- 日期篩選插槽（上方按鈕區） -->
      <template #dateFilter>
        <AddNewItem
          :btnName="`${t('BUTTON_CREATE')}${t('AGENT_ACCOUNT_MANAGEMENT_DIALOG_TITLE')}`"
          @add="addNewItem"
        >
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>
      <!-- 搜尋欄位插槽 -->
      <template #searchFilter>
        <div class="space-y-2 xl:flex xl:space-x-2 xl:space-y-0 mb-2 2xl:mb-0">
          <el-select
            v-model="selectedGaId"
            :placeholder="$t('AGENT_ACCOUNT_MANAGEMENT_GA_SEARCH')"
            :clearable="true"
            size="large"
            class="min-w-[220px]"
          >
            <el-option
              v-for="item in gaOptions"
              :key="item.id"
              :label="`${item.ga_name}（${item.ga_company_name}）`"
              :value="item.id"
            />
          </el-select>

          <el-popover
            class="box-item"
            :width="220"
            :content="$t('AGENT_DEPOSIT_SEARCH_POPOVER_CONTENT')"
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

          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>

  <AgentAccountManagementDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :gaOptions="gaOptions"
    :langOptions="langOptions"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />

  <template v-if="secret">
    <el-dialog
      v-model="showSecretDialog"
      :title="secret.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="secretCloseHandler"
    >
      <el-form
        ref="secretFormRef"
        :model="secret"
        :rules="secretRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item :label="$t('AGENT_ACCOUNT_MANAGEMENT_CURRENT_KEY')">
          <el-input v-model="secret.currentKey" readonly />
        </el-form-item>
        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="secret.password"
            show-password
            type="password"
            @blur="clearSecretError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="secretCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="secretSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
</template>
<script setup lang="ts">
import EnumAPI, { EnumVO } from "@/api/enum.api";
import key from "@/assets/images/key.png";
import $ from "jquery";
import AgentAccountManagementAPI, {
  UpdateAgentAccountParam,
  AgentAccountManagementPageQuery,
  AgentAccountManagementVO,
} from "@/api/agent-account_management.api";
// 表單驗證與提示訊息相關工具
import {
  actionErrorAlert,
  actionResultAlert,
  errorAlert,
  getDataErrorAlert,
} from "@/utils/message";
// 引入 Loading 狀態控制
import { useLoadingStore } from "@/store";
// 引入總代理下拉選單
import GaAccountManagementAPI, { AgentOption } from "@/api/ga_account_management.api";
import AuthAPI from "@/api/auth.api";
import { clearAllCustomValidators, clearFieldError, updateValidationRules } from "@/utils/field";
import { FormInstance, FormRules } from "element-plus";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const gaOptions = ref<AgentOption[]>([] as AgentOption[]);
const langOptions = ref<EnumVO[]>([] as EnumVO[]);
// 原始表單資料（用於重設編輯內容）
const originalFormData = ref<UpdateAgentAccountParam | null>(null);
const closeDialog = (reQuery: boolean = false) => {
  originalFormData.value = null;
  dialogVisible.value = false;
  if (reQuery) {
    handleQuery();
  }
};

const { t, locale } = useI18n();
const { setLoading } = useLoadingStore();
const isEdit = ref(false);
const formData = ref<UpdateAgentAccountParam>(getEmptyFormData());
function getEmptyFormData(): UpdateAgentAccountParam {
  return {
    id: null,
    ga_id: "",
    agent_name: "",
    company_name: "",
    business_contact: "",
    tech_contact: "",
    rake: 0,
    gold_split: 0,
    ev_split: 0,
    shop_split: 0,
    master_split: 0,
    warning_threshold: 0,
    freeze_fl: false,
    join_sea_fl: false,
    del_fl: false,
    lang: 1,
  };
}

const selectedGaId = ref<number | undefined>();

// 新增按鈕
const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("AGENT_ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
  });
  dialogVisible.value = true;
};

// 重設表單內容（依據是否為編輯模式）
async function resetForm() {
  if (isEdit.value && originalFormData.value) {
    formData.value = Object.assign(
      formData.value,
      JSON.parse(JSON.stringify(originalFormData.value))
    );
  } else {
    formData.value = getEmptyFormData();
  }
}

// 更新語系
watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

watch(selectedGaId, (val) => {
  queryParams.ga_id = val || undefined;
});

const total = ref(0);
// 表格資料陣列
const dataAry = ref<AgentAccountManagementVO[]>([] as AgentAccountManagementVO[]);
// 查詢參數（分頁與搜尋）
const queryParams = reactive<AgentAccountManagementPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  ga_id: undefined,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: "",
    ga_id: undefined,
  });
  selectedGaId.value = undefined;
};

// 更新表格資料
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
  { data: "id_field", title: "ID", className: "text-left!" },
  { data: "agent_name", title: t("AGENT_ACCOUNT_MANAGEMENT_AGENT_NAME") },
  { data: "company_name", title: t("AGENT_ACCOUNT_MANAGEMENT_COMPANY_NAME") },
  { data: "ga_name", title: t("AGENT_ACCOUNT_MANAGEMENT_GA_NAME") },
  { data: "ga_company_name", title: t("AGENT_ACCOUNT_MANAGEMENT_GA_COMPANY_NAME") },
  { data: "gold_split", title: t("AGENT_ACCOUNT_MANAGEMENT_GOLD_SPLIT") },
  { data: "ev_split", title: t("AGENT_ACCOUNT_MANAGEMENT_EV_SPLIT") },
  { data: "shop_split", title: t("AGENT_ACCOUNT_MANAGEMENT_SHOP_SPLIT") },
  { data: "master_split", title: t("AGENT_ACCOUNT_MANAGEMENT_MASTER_SPLIT") },
  {
    data: "freeze_fl",
    title: t("AGENT_ACCOUNT_MANAGEMENT_FREEZE_FL"),
    className: "text-center!",
    render: (data: any, _name: string, _row: AgentAccountManagementVO) => {
      const isTrue = data === true || data === 1;
      return `
            <div class="rounded-full w-fit px-5 py-1 m-auto  text-center ${isTrue ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
              ${_row.freeze_fl_name}
            </div>
          `;
    },
  },
  {
    data: "del_fl",
    title: t("AGENT_ACCOUNT_MANAGEMENT_DEL_FL"),
    className: "text-center!",
    render: (data: any, _name: string, _row: AgentAccountManagementVO) => {
      const isTrue = data === true || data === 1;
      return `
            <div class="rounded-full w-fit px-5 py-1 m-auto  text-center ${isTrue ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
              ${_row.del_fl_name}
            </div>
          `;
    },
  },

  {
    data: "join_sea_fl",
    title: t("AGENT_ACCOUNT_MANAGEMENT_JOIN_SEA_FL"),
    className: "text-center!",
    render: (data: any, _name: string, row: AgentAccountManagementVO) => {
      const isTrue = data === true || data === 1;
      return `
      <div class="rounded-full w-fit px-5 py-1 m-auto  text-center ${isTrue ? "bg-[--bg-success] text-[--text-success]" : "bg-[--bg-error] text-[--text-error]"}">
        ${row.join_sea_fl_name}
      </div>
    `;
    },
  },

  {
    data: "key_button",
    title: t("AGENT_ACCOUNT_MANAGEMENT_KEY"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: AgentAccountManagementVO) => {
      return row.del_fl
        ? ""
        : `
      <img
        src="${key}"
        class="w-[20px] mx-auto cursor-pointer key-btn"
        data-id="${row.id}"
      />
    `;
    },
  },

  {
    data: "create_time",
    title: t("AGENT_ACCOUNT_MANAGEMENT_CREATE_TIME"),
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
    title: t("AGENT_ACCOUNT_MANAGEMENT_UPDATE_TIME"),
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
    title: t("AGENT_ACCOUNT_MANAGEMENT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: AgentAccountManagementVO) => {
      return row.del_fl
        ? ""
        : `<div class="action-buttons" data-id="${row.id}" data-field="agent_name,company_name"></div>`;
    },
  },
];
const columns = ref(getColumns());
// 查詢 API
function handleQuery() {
  setLoading(true);
  checkSync();

  const queryData = { ...queryParams };
  if (queryData.sort === "id_field") {
    queryData.sort = "id";
  }

  AgentAccountManagementAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_AGENT_ACCOUNT_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });
}

const handleEdit = async (model: AgentAccountManagementVO) => {
  setLoading(true);
  AgentAccountManagementAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        errorAlert(
          t,
          `${t("MSG_GET_DATA_FAIL", { page: `${model.agent_name}(${model.company_name})` })}, message: ${msg}`
        );
        return;
      } else {
        Object.assign(formData.value, data[0]);
        originalFormData.value = JSON.parse(JSON.stringify(data[0]));
        isEdit.value = true;
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("AGENT_ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.agent_name}(${model.company_name})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  AgentAccountManagementAPI.delete({ id: data.id })
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
  AgentAccountManagementAPI.sync()
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
  AgentAccountManagementAPI.checkSync()
    .then(({ result, msg }) => {
      async.value = result;
      asyncMsg.value = msg;
    })
    .finally(() => {
      setLoading(false);
    });
}

const getInitialData = async () => {
  setLoading(true);
  try {
    const [langs, gas] = await Promise.all([
      EnumAPI.get("Language"),
      GaAccountManagementAPI.ga_options(),
    ]);

    langOptions.value = langs;
    gaOptions.value = gas.data;
  } catch {
    getDataErrorAlert(t, "PAGE_AGENT_ACCOUNT_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

const isSubmit = ref(false);
const clearSecretError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(secretFormRef.value, secretRules, field);
  }
};
const secretSaveHandler = async () => {
  if (!secretFormRef.value) return;

  await secretFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      // 取得加密工具
      const encrypt = await AuthAPI.getKey();

      // 發送加密後的密碼
      const { result, msg, errors } = await AgentAccountManagementAPI.updateSecretKey({
        id: secret.value?.agentId!,
        password: encrypt.encrypt(secret.value?.password!) as string,
      });

      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(secretFormRef.value, secretRules, errors);
        }
      } else {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      secretCloseHandler();
      handleQuery();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const secretCloseHandler = () => {
  secret.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(secretRules);
};
const showSecretDialog = computed(() => (secret.value && secret.value.show) ?? false);
const secret = ref<null | {
  show: boolean;
  title: string;
  agentId: number | null;
  currentKey: string;
  password: string;
}>(null);
const secretFormRef = ref<FormInstance>();
const secretRules: FormRules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
});

const route = useRoute();

const bindingEvent = () => {
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .key-btn`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .key-btn`,
      // eslint-disable-next-line no-unused-vars
      async function (this: HTMLElement) {
        const element = this as HTMLDivElement;
        const id = $(element).data("id");
        if (!id) return;

        setLoading(true);
        try {
          const res = await AgentAccountManagementAPI.getSecretKey({ id });
          if (!res.result) {
            ElMessage.error(
              t("MSG_GET_DATA_FAIL", { page: t("AGENT_ACCOUNT_MANAGEMENT_KEY") }) +
                ` message: ${res.msg}`
            );
            return;
          }
          secret.value = {
            agentId: id,
            show: true,
            title: `${t("AGENT_ACCOUNT_MANAGEMENT_KEY_UPDATE")}`,
            currentKey: res.secret_key,
            password: "",
          };
        } finally {
          setLoading(false);
        }
      }
    );
};

onMounted(() => {
  handleQuery();
  getInitialData();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
