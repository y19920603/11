<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="MARQUEE"></PageTitle>
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
        <AddNewItem :btnName="`${t('BUTTON_CREATE_MARQUEE')}`" @add="addNewItem">
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>

      <template #searchFilter>
        <el-select
          v-model="statusType"
          :placeholder="$t('BANNER_MANAGEMENT_STATUS')"
          :clearable="true"
          size="large"
          class="min-w-[132px]!"
        >
          <el-option
            v-for="item in publicTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="queryParams.search"
          class="h-[40px]! min-w-[220px]"
          size="large"
          :placeholder="$t('MARQUEE_TITLE')"
        ></el-input>
        <div class="flex space-x-2">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>

  <MarqueeDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :isSmallScreen="isSmallScreen"
    :publicStartTypes="publicStartTypes"
    :publicEndTypes="publicEndTypes"
    :langs="langs"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import MarqueeAPI, { MarqueePageQuery, MarqueeVO, UpdateMarqueeParam } from "@/api/marquee.api";
import { usePublicEndTypes, usePublicStartTypes } from "@/utils/publicTypes";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { appConfig } from "@/utils/config";
import { useMarqueeStatus } from "@/utils/marquee";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateMarqueeParam | null>(null);
const closeDialog = (reQuery: boolean = false) => {
  originalFormData.value = null;
  dialogVisible.value = false;
  if (reQuery) {
    handleQuery();
  }
};

const { t, locale } = useI18n();
const langs = ref<EnumVO[]>([] as EnumVO[]);
const { setLoading } = useLoadingStore();
const publicTypes = ref(useMarqueeStatus(t));
// 新增 修改
const isEdit = ref(false);

// formData
const formData = ref<UpdateMarqueeParam>({
  id: null,
  title: "",
  status: true,
  interval_min: 0,
  start_time: "",
  end_time: "",
  messages: [],
  start_type: 1,
  end_type: 1,
});
function getEmptyFormData(): UpdateMarqueeParam {
  return {
    id: null,
    title: "",
    status: true,
    interval_min: "",
    messages: [],
    start_type: 1,
    end_type: 1,
    start_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    end_time: dayjs(appConfig.value.MAX_DATE_TIME).format("YYYY-MM-DD HH:mm:ss"),
  };
}

const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("DIALOG_TITLE", {
    action: t("BUTTON_CREATE"),
    key: t("PAGE_MARQUEE"),
  });
  dialogVisible.value = true;
};

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

// 上/下 架時間 下拉選單改變
watch(
  () => formData.value.start_type,
  (newValue) => {
    if (newValue == 1) {
      Object.assign(formData.value, { start_time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
    }
  },
  {
    immediate: true,
  }
);
watch(
  () => formData.value.end_type,
  (newValue) => {
    if (newValue == 1) {
      Object.assign(formData.value, {
        end_time: dayjs(appConfig.value.MAX_DATE_TIME).format("YYYY-MM-DD HH:mm:ss"),
      });
    }
  },
  {
    immediate: true,
  }
);

const publicStartTypes = ref(usePublicStartTypes(t));
const publicEndTypes = ref(usePublicEndTypes(t));
// 列表
watch(locale, () => {
  columns.value = getColumns();
  publicStartTypes.value = usePublicStartTypes(t);
  publicEndTypes.value = usePublicEndTypes(t);
  publicTypes.value = useMarqueeStatus(t);
  updateDataTable({});
});
const total = ref(0);
const dataAry = ref<MarqueeVO[]>([] as MarqueeVO[]);
const queryParams = reactive<MarqueePageQuery>({
  start: 0,
  length: 10,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  status: null,
});

const statusType = ref<number | "">("");
watch(statusType, (val) => {
  if (val === 1) queryParams.status = true;
  else if (val === 0) queryParams.status = false;
  else queryParams.status = null;
});

watchEffect(() => {
  if (queryParams.status === true) statusType.value = 1;
  else if (queryParams.status === false) statusType.value = 0;
  else statusType.value = "";
});

const resetSearch = () => {
  Object.assign(queryParams, {
    status: null,
    search: "",
  });
};

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
  { data: "id_field", title: t("MARQUEE_ID"), className: "text-left!" },
  { data: "title", title: t("MARQUEE_TITLE") },
  {
    data: "status",
    title: t("MARQUEE_STATUS"),
    className: "text-center!",
    render: (data: string, _name: string, _row: MarqueeVO) => {
      return `
              <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!_row.status_code ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
                ${data}
              </div>
            `;
    },
  },
  {
    data: "interval_min",
    title: t("MARQUEE_INTERVAL_MIN"),
  },
  {
    data: "start_time",
    title: t("MARQUEE_START_TIME"),
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
    data: "end_time",
    title: t("MARQUEE_END_TIME"),
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
    data: "create_time",
    title: t("MARQUEE_CREATE_TIME"),
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
    title: t("MARQUEE_UPDATE_TIME"),
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
    title: t("MARQUEE_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: MarqueeVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field="title"></div>`;
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
  MarqueeAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_MARQUEE");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: MarqueeVO) => {
  setLoading(true);
  MarqueeAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: `${model.id}` })}, message: ${msg}`, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
        return;
      } else {
        Object.assign(formData.value, {
          ...data,
          status: data.status_code,
          end_type: data.end_time == appConfig.value.MAX_DATE_TIME ? 1 : 0,
          start_type: 0,
        });
        originalFormData.value = JSON.parse(
          JSON.stringify({
            ...data,
            status: data.status_code,
            end_type: data.end_time == appConfig.value.MAX_DATE_TIME ? 1 : 0,
            start_type: 0,
          })
        );
        isEdit.value = true;
        resetForm();
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("PAGE_MARQUEE"),
        });
        dialogVisible.value = true;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, `${model.id}`);
    })
    .finally(() => {
      setLoading(false);
    });
};

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  MarqueeAPI.delete({ id: data.id })
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
  MarqueeAPI.sync()
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
  MarqueeAPI.checkSync()
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
    const [langOptions] = await Promise.all([EnumAPI.get("GameLanguage")]);

    langs.value = langOptions;
  } catch {
    getDataErrorAlert(t, "PAGE_BANNER_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

const isSmallScreen = ref(false);
const checkScreen = () => {
  isSmallScreen.value = window.innerWidth < 640;
};
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreen);
});

onMounted(() => {
  getInitialData();

  handleQuery();

  checkScreen();
  window.addEventListener("resize", checkScreen);
});
</script>
<style lang="scss" scoped>
.marquee-demo-tabs {
  :deep(.is-active) {
    background: #8480ff;
    color: #fff;
  }
  :deep(.el-tabs__item:hover) {
    color: #8480ff;
  }

  :deep(.el-tabs__item.is-active) {
    color: #fff;
  }

  :deep(
    .el-tabs__header .el-tabs__item:nth-child(2),
    .el-tabs__header .el-tabs__item:nth-child(2)
  ) {
    padding-left: 20px;
  }
  :deep(.el-tabs__header .el-tabs__item:last-child, .el-tabs__header .el-tabs__item:last-child) {
    padding-right: 20px;
  }
}
</style>
