<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="GA_ACCOUNT_MANAGEMENT"></PageTitle>
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
        <AddNewItem :btnName="`${t('BUTTON_CREATE_ACCOUNT')}`" @add="addNewItem">
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>
      <template #searchFilter>
        <div class="space-y-2 xl:flex xl:space-x-2 xl:space-y-0 mb-2 2xl:mb-0">
          <el-popover
            class="box-item"
            :width="220"
            :content="$t('GA_ACCOUNT_MANAGEMENT_SEARCH_POPOVER_CONTENT')"
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

          <SearchButtons :resetBtn="false" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>
  <GaAccountManagementDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import GaAccountManagementAPI, {
  UpdateGaAccountParam,
  GaAccountManagementPageQuery,
  GaAccountManagementVO,
} from "@/api/ga_account_management.api";
import {
  actionErrorAlert,
  actionResultAlert,
  errorAlert,
  getDataErrorAlert,
} from "@/utils/message";
import { useLoadingStore } from "@/store";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateGaAccountParam | null>(null);
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
const formData = ref<UpdateGaAccountParam>(getEmptyFormData());
function getEmptyFormData(): UpdateGaAccountParam {
  return {
    id: null,
    ga_name: "",
    ga_company_name: "",
    business_contact: "",
    tech_contact: "",
    gold_split: 0,
    shop_split: 0,
    ev_split: 0,
    del_fl: false,
    freeze_fl: false,
  };
}

// 新增按鈕
const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("GA_ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
  });
  dialogVisible.value = true;
};

// 初始化 form
function resetForm() {
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

const total = ref(0);
const dataAry = ref<GaAccountManagementVO[]>([] as GaAccountManagementVO[]);
const queryParams = reactive<GaAccountManagementPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: "",
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
  { data: "id_field", title: "ID", className: "text-left!" },
  { data: "ga_name", title: t("GA_ACCOUNT_MANAGEMENT_AGENT_NAME") },
  { data: "ga_company_name", title: t("GA_ACCOUNT_MANAGEMENT_COMPANY_NAME") },
  { data: "gold_split", title: t("GA_ACCOUNT_MANAGEMENT_GOLD_SPLIT") },
  { data: "shop_split", title: t("GA_ACCOUNT_MANAGEMENT_SHOP_SPLIT") },
  { data: "ev_split", title: t("GA_ACCOUNT_MANAGEMENT_EV_SPLIT") },
  {
    data: "freeze_fl",
    title: t("GA_ACCOUNT_MANAGEMENT_FREEZE_FL"),
    className: "text-center!",
    render: (data: number, _name: string, _row: GaAccountManagementVO) => {
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
            ${_row.freeze_fl_name}
          </div>
        `;
    },
  },
  {
    data: "del_fl",
    title: t("GA_ACCOUNT_MANAGEMENT_DEL_FL"),
    className: "text-center!",
    render: (data: number, _name: string, _row: GaAccountManagementVO) => {
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
            ${_row.del_fl_name}
          </div>
        `;
    },
  },
  {
    data: "create_time",
    title: t("GA_ACCOUNT_MANAGEMENT_CREATE_TIME"),
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
    title: t("GA_ACCOUNT_MANAGEMENT_UPDATE_TIME"),
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
    title: t("GA_ACCOUNT_MANAGEMENT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: any) => {
      return row.del_fl
        ? ""
        : `<div class="action-buttons" data-id="${row.id}" data-field="ga_name,ga_company_name"></div>`;
    },
  },
];
const columns = ref(getColumns());

// DataTableQuery
function handleQuery() {
  setLoading(true);
  checkSync();

  const queryData = { ...queryParams };
  if (queryData.sort === "id_field") {
    queryData.sort = "id";
  }

  GaAccountManagementAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_GA_ACCOUNT_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: GaAccountManagementVO) => {
  setLoading(true);
  GaAccountManagementAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        errorAlert(
          t,
          `${t("MSG_GET_DATA_FAIL", { page: `${model.ga_name}(${model.ga_company_name})` })}, message: ${msg}`
        );
        return;
      } else {
        Object.assign(formData.value, data[0]);
        originalFormData.value = JSON.parse(JSON.stringify(data[0]));
        isEdit.value = true;
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("GA_ACCOUNT_MANAGEMENT_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.ga_name}(${model.ga_company_name})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  GaAccountManagementAPI.delete({ id: data.id })
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
  GaAccountManagementAPI.sync()
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
  GaAccountManagementAPI.checkSync()
    .then(({ result, msg }) => {
      async.value = result;
      asyncMsg.value = msg;
    })
    .finally(() => {
      setLoading(false);
    });
}

onMounted(() => {
  handleQuery();
});
</script>
