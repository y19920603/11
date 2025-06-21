<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="ACCOUNT_MANAGEMENT"></PageTitle>
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
        <AddNewItem :btnName="`${t('BUTTON_CREATE_ACCOUNT')}`" @add="addAccountHandler" />
      </template>
      <template #searchFilter>
        <el-select
          v-model="roleId"
          :placeholder="$t('ACCOUNT_MANAGEMENT_ROLE_ID')"
          :clearable="true"
          size="large"
          class="min-w-[160px]!"
        >
          <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-popover
          class="box-item"
          :width="220"
          :content="$t('ACCOUNT_MANAGEMENT_SEARCH_POPOVER_CONTENT')"
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

  <AccountManagementDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :country="countryAry"
    :roles="roles"
    :gaOptions="gaOptions"
    :langs="langs"
    :agentOptions="agentOptions"
    :permissionOptions="permissionOptions"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import AccountManagementAPI, {
  AccountManagementPageQuery,
  AccountManagementVO,
  UpdateAccountParam,
} from "@/api/account_management.api";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { useCountryTypes } from "@/utils/countryTypes";
import GaAccountManagementAPI, { AgentOption, GaOption } from "@/api/ga_account_management.api";
import PermissionAPI, { PermissionGroupOptionVO } from "@/api/permission_setting.api";
import { LanguageEnum } from "@/enums";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateAccountParam | null>(null);
const closeDialog = (reQuery: boolean = false) => {
  originalFormData.value = null;
  dialogVisible.value = false;
  if (reQuery) {
    handleQuery();
  }
};

const { t, locale } = useI18n();
const { setLoading } = useLoadingStore();
const countryAry = useCountryTypes();
const gaOptions = ref<GaOption[]>([] as GaOption[]);
const agentOptions = ref<AgentOption[]>([] as AgentOption[]);
const langs = ref<EnumVO[]>([] as EnumVO[]);
const permissionOptions = ref<PermissionGroupOptionVO[]>([] as PermissionGroupOptionVO[]);
const roles = ref<EnumVO[]>([] as EnumVO[]);
const isEdit = ref(false);

// formData
const formData = ref<UpdateAccountParam>({
  id: null,
  role_id: 1,
  ga_id: null,
  agent_id: null,
  user_name: "",
  email: "",
  password: "",
  country: "HK",
  country_code: "852",
  local_phone_number: "",
  lang: LanguageEnum.ZH_TW,
  permission_group_id: null,
});
function getEmptyFormData(): UpdateAccountParam {
  return {
    id: null,
    role_id: 1,
    ga_id: gaOptions.value[0]?.id ?? null,
    agent_id: agentOptions.value[0]?.id ?? null,
    user_name: "",
    email: "",
    password: "",
    country: "HK",
    country_code: "852",
    local_phone_number: "",
    lang: LanguageEnum.ZH_TW,
    permission_group_id: null,
  };
}

// 新增按鈕
async function addAccountHandler() {
  isEdit.value = false;
  resetForm();

  await initOption();

  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
  });
  dialogVisible.value = true;
}

// 初始化 form
const resetForm = () => {
  if (isEdit.value && originalFormData.value) {
    if (originalFormData.value) {
      assignExistingProps(formData.value, originalFormData.value);
    }
  } else {
    formData.value = getEmptyFormData();
  }
};

// 更新語系
watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const total = ref(0);
const dataAry = ref<AccountManagementVO[]>([] as AccountManagementVO[]);
const queryParams = reactive<AccountManagementPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  role_id: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: "",
    role_id: null,
  });
};

const roleId = computed({
  get: () => queryParams.role_id ?? "",
  set: (val) => {
    queryParams.role_id = val;
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
  {
    data: "user_name",
    title: t("ACCOUNT_MANAGEMENT_USER_NAME"),
  },
  {
    data: "ga_id",
    title: t("ACCOUNT_MANAGEMENT_GA_ID"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: AccountManagementVO) => _row.ga_name,
  },
  {
    data: "agent_id",
    title: t("ACCOUNT_MANAGEMENT_AGENT_ID"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: AccountManagementVO) => _row.agent_name,
  },

  { data: "email", title: t("ACCOUNT_MANAGEMENT_EMAIL") },
  {
    data: "country_code",
    title: t("ACCOUNT_MANAGEMENT_PHONE"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: AccountManagementVO) =>
      `(${_row.country_code})${_row.local_phone_number}`,
  },
  {
    data: "create_time",
    title: t("ACCOUNT_MANAGEMENT_CREATE_TIME"),
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
    data: "country",
    title: t("ACCOUNT_MANAGEMENT_COUNTRY"),
    render: (data: string) => {
      const country = countryAry.find((e) => e.value === data);
      return country ? `[${country?.value}] ${country?.name}` : data;
    },
  },
  {
    data: "lang",
    title: t("ACCOUNT_MANAGEMENT_LANG"),
    render: (_data: number, _name: string, _row: AccountManagementVO) => _row.lang_name,
  },
  {
    data: "del_fl",
    title: t("ACCOUNT_MANAGEMENT_DEL_FL"),
    className: "text-center!",
    render: (data: number, _name: string, _row: AccountManagementVO) => {
      return `
            <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
              ${_row.del_fl_name}
            </div>
          `;
    },
  },
  {
    data: "permission_group_id",
    title: t("ACCOUNT_MANAGEMENT_PERMISSION_GROUP_ID"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: AccountManagementVO) => _row.permission_group_name,
  },
  {
    data: "update_time",
    title: t("ACCOUNT_MANAGEMENT_UPDATE_TIME"),
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
    title: t("ACCOUNT_MANAGEMENT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: any) => {
      return row.del_fl
        ? ""
        : `<div class="action-buttons" data-id="${row.id}" data-field="user_name"></div>`;
    },
  },
];
const columns = ref(getColumns());

// DataTableQuery
function handleQuery() {
  setLoading(true);
  AccountManagementAPI.getAll(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ?? [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_ACCOUNT_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = async (model: AccountManagementVO) => {
  setLoading(true);
  await initOption();

  AccountManagementAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(
          `${t("MSG_GET_DATA_FAIL", { page: `${model.id}(${model.user_name})` })}, message: ${msg}`,
          {
            confirmButtonText: t("BUTTON_CONFIRM"),
          }
        );
        return;
      } else {
        originalFormData.value = JSON.parse(JSON.stringify(data[0]));
        if (originalFormData.value) {
          assignExistingProps(formData.value, originalFormData.value);
        }
        isEdit.value = true;
        resetForm();
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.id}(${model.user_name})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

watch(
  () => formData.value.ga_id,
  async (newValue) => {
    if (!newValue) return;
    const agentResult = await GaAccountManagementAPI.agent_options({ ga_id: newValue as number });
    if (agentResult.result) {
      agentOptions.value = agentResult.data ?? [];
      formData.value.agent_id = (agentResult.data ?? []).length > 0 ? agentResult.data[0].id : null;
    } else {
      ElMessageBox.alert(
        `${t("MSG_GET_DATA_FAIL", { page: t("PAGE_ACCOUNT_MANAGEMENT") })}, message: ${agentResult.msg}`,
        {
          confirmButtonText: t("BUTTON_CONFIRM"),
        }
      );
    }
  },
  {
    immediate: true,
  }
);

async function initOption() {
  const showFetchError = (msg: string) => {
    ElMessageBox.alert(
      `${t("MSG_GET_DATA_FAIL", { page: t("PAGE_ACCOUNT_MANAGEMENT") })}, message: ${msg}`,
      {
        confirmButtonText: t("BUTTON_CONFIRM"),
      }
    );
  };

  try {
    const [gaResult] = await Promise.all([GaAccountManagementAPI.ga_options()]);
    if (gaResult.result) {
      gaOptions.value = gaResult.data;
      formData.value.ga_id = gaResult.data[0].id;
    } else {
      showFetchError(gaResult.msg);
    }
  } catch (error) {
    ElMessageBox.alert(
      `${t("MSG_GET_DATA_FAIL", { page: t("PAGE_ACCOUNT_MANAGEMENT") })}, message: ${error}`,
      {
        confirmButtonText: t("BUTTON_CONFIRM"),
      }
    );
  }
}

function assignExistingProps<T extends object>(
  target: T,
  source: Partial<T>,
  defaultValue: any = ""
) {
  Object.keys(target).forEach((key) => {
    if (key in source) {
      (target as any)[key] = (source as any)[key];
    } else {
      (target as any)[key] = defaultValue;
    }
  });
}

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  AccountManagementAPI.delete({ id: data.id })
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

// 初始化資料
const getInitialData = async () => {
  setLoading(true);
  try {
    const [rolesRes, langsRes, permissionGroupOptions] = await Promise.all([
      EnumAPI.get("Role"),
      EnumAPI.get("Language"),
      PermissionAPI.permissionGroupOptions(),
    ]);

    roles.value = rolesRes;
    langs.value = langsRes;
    permissionOptions.value = permissionGroupOptions.data;
  } catch {
    getDataErrorAlert(t, "PAGE_ACCOUNT_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  handleQuery();
  getInitialData();
});
</script>
<style>
.vue-country-intl-inputer,
.vue-country-intl-inputer .country-intl-input,
.vue-country-intl-inputer .country-intl-label {
  background-color: #252735;
}

.vue-country-intl-inputer .country-intl-input {
  border: 1px solid #4c4d4f;
}

.vue-country-intl-inputer .country-intl-label {
  line-height: 0px;
  top: 4px;
}

.vue-country-list-wrap {
  background-color: #252735 !important; /* 自訂背景色 */
  border: 1px solid #4c4d4f;
}

.vue-country-item {
  color: #fff;
}
</style>
