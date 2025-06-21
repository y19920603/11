<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="WHITE_LIST"></PageTitle>
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
        <AddNewItem :btnName="`${t('BUTTON_CREATE_LIST')}`" @add="addNewItem">
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>

      <template #searchFilter>
        <el-select
          v-model="statusType"
          :placeholder="$t('WHITE_LIST_STATUS')"
          :clearable="true"
          size="large"
          class="min-w-[160px]!"
        >
          <el-option
            v-for="item in statusTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-input
          v-model="queryParams.search"
          class="h-[40px]! min-w-[220px]"
          :placeholder="$t('WHITE_LIST_IP')"
        ></el-input>
        <div class="flex space-x-2 pb-2 lg:pb-0">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>

  <WhiteList
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :whiteTypes="whiteTypes"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import WhiteListAPI, { UpdateIpParam, WhiteListPageQuery, WhiteListVO } from "@/api/white_list.api";
import { useWhiteTypes } from "@/utils/whiteTypes";
import { useStatusTypes } from "@/utils/statusTypes";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateIpParam | null>(null);
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

const formData = ref<UpdateIpParam>(getEmptyFormData());
function getEmptyFormData(): UpdateIpParam {
  return {
    id: null,
    ip: "",
    type: 1,
    description: "",
    status: 1,
  };
}

const whiteTypes = ref(useWhiteTypes(t));
const statusTypes = ref(useStatusTypes(t));

// 新增按鈕
const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("WHITE_LIST_DIALOG_TITLE"),
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
  whiteTypes.value = useWhiteTypes(t);
  statusTypes.value = useStatusTypes(t);
  updateDataTable({}, false);
});

const total = ref(0);
const dataAry = ref<WhiteListVO[]>([] as WhiteListVO[]);
const queryParams = reactive<WhiteListPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  status: null,
});

const resetSearch = () => {
  Object.assign(queryParams, {
    search: "",
    status: null,
  });
};

const statusType = ref<number | undefined>(undefined);
watch(statusType, (val) => {
  if (val === 1) queryParams.status = true;
  else if (val === 0) queryParams.status = false;
  else queryParams.status = undefined;
});

watchEffect(() => {
  if (queryParams.status === true) statusType.value = 1;
  else if (queryParams.status === false) statusType.value = 0;
  else statusType.value = undefined;
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
  { data: "id_field", title: t("WHITE_LIST_ID"), className: "text-left!" },
  {
    data: "type",
    title: t("WHITE_LIST_TYPE"),
    className: "text-center!",
    render: (data: number, _name: string, _row: WhiteListVO) => {
      return `
            <div class="w-fit rounded-full px-5 py-1 text-center m-auto text-white ${_row.type_code !== 1 ? "bg-[--bg-error] " : "bg-[--bg-success] "}" >
              ${data}
            </div>
          `;
    },
  },
  { data: "ip", title: t("WHITE_LIST_IP") },
  { data: "description", title: t("WHITE_LIST_DESCRIPTION") },
  {
    data: "status",
    title: t("WHITE_LIST_STATUS"),
    className: "text-center!",
    render: (data: number, _name: string, _row: WhiteListVO) => {
      return `
            <div class="w-fit rounded-full px-5 py-1 text-center m-auto ${!_row.status_code ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
              ${data}
            </div>
          `;
    },
  },
  {
    data: "create_time",
    title: t("WHITE_LIST_CREATE_TIME"),
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
    title: t("WHITE_LIST_UPDATE_TIME"),
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
    title: t("WHITE_LIST_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: WhiteListVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field="id,ip"></div>`;
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
  WhiteListAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_WHITE_LIST");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: WhiteListVO) => {
  setLoading(true);
  WhiteListAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(
          `${t("MSG_GET_DATA_FAIL", { page: `${model.id}(${model.ip})` })}, message: ${msg}`,
          {
            confirmButtonText: t("BUTTON_CONFIRM"),
            type: "error",
          }
        );
        return;
      } else {
        Object.assign(formData.value, { ...data, id: model.id });
        originalFormData.value = JSON.parse(JSON.stringify(data));
        isEdit.value = true;
        resetForm();
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("WHITE_LIST_DIALOG_TITLE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.id}(${model.ip})`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  WhiteListAPI.delete({ id: data.id })
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
  WhiteListAPI.sync()
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
  WhiteListAPI.checkSync()
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
