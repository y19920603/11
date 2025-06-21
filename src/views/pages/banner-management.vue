<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="BANNER_MANAGEMENT"></PageTitle>
  <div class="p-8">
    <el-tabs v-model="activeName" type="card" class="demo-tabs mb-0 2xl:mb-7">
      <el-tab-pane v-for="lang in langs" :label="lang.name" :name="lang.id"></el-tab-pane>
    </el-tabs>
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
        <AddNewItem
          :btnName="`${t('BANNER_MANAGEMENT_BANNER', { key: t('BUTTON_ADD') })}`"
          @add="addNewItem"
        >
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>

      <template #searchFilter>
        <div
          class="space-y-2 items-center xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-10 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-select
              v-model="serverId"
              :placeholder="$t('GAME_SERVER_STATUS_SERVER_NAME')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in gameModes"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-model="statusType"
              :placeholder="$t('BANNER_MANAGEMENT_STATUS')"
              :clearable="true"
              size="large"
              class="w-full! md:w-[180px]!"
            >
              <el-option
                v-for="item in publicTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-input
              v-model="queryParams.search"
              class="h-[40px]! min-w-[220px]"
              :placeholder="$t('BANNER_MANAGEMENT_PIC_DESC')"
            ></el-input>
          </div>
          <div class="flex space-x-2 pb-2 lg:pb-0">
            <SearchButtons @reset="resetSearch" @search="updateDataTable" />
          </div>
        </div>
      </template>
    </DataTable>
  </div>

  <el-dialog
    v-if="dialog.visible"
    v-model="dialog.visible"
    :title="dialog.title"
    class="w-[90vw]! md:w-[600px]!"
    @closed="handleCloseDialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item prop="server_id" :label="`${$t('BANNER_MANAGEMENT_PIC_TYPE')} :`">
        <el-select v-model="formData.server_id!" :clearable="false">
          <el-option v-for="item in gameModes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item prop="image_file" :label="`${$t('BANNER_MANAGEMENT_PIC_URL')} :`">
        <ImageUploader
          ref="imageUploaderRef"
          :imagePic="formData.image_pic"
          @change="onImageChange"
        >
          <el-icon size="24"><UploadFilled /></el-icon>
          <div>{{ $t("BANNER_MANAGEMENT_UPLOAD_IMG") }}</div>
          <div class="text-red">
            *
            {{
              formData.server_id !== 0
                ? $t("BANNER_MANAGEMENT_RECOMMENDED_SIZE_GAME")
                : $t("BANNER_MANAGEMENT_RECOMMENDED_SIZE_HALL")
            }}
          </div>
        </ImageUploader>
      </el-form-item>
      <el-form-item prop="description" :label="`${$t('BANNER_MANAGEMENT_PIC_DESC')} :`">
        <el-input v-model="formData.description" @blur="clearError('description')" />
      </el-form-item>
      <el-form-item prop="link_url" :label="`${$t('BANNER_MANAGEMENT_LINK_URL')} :`">
        <el-input v-model="formData.link_url" @blur="clearError('link_url')" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item prop="sort_order" :label="`${$t('BANNER_MANAGEMENT_PRIORITY')} :`">
            <el-select v-model="formData.sort_order" :clearable="false">
              <el-option v-for="n in 10" :key="n" :label="n.toString()" :value="n" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item prop="lang" :label="`${$t('BANNER_MANAGEMENT_LANG')} :`">
            <el-select v-model="formData.lang" :clearable="false">
              <el-option v-for="lang in langs" :key="lang.id" :label="lang.name" :value="lang.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item prop="status" :label="`${$t('PUBLISH_LIST')} :`" class="flex items-center">
        <el-switch
          v-model="formData.status"
          size="large"
          width="60"
          inline-prompt
          :active-text="$t('PUBLISH_LIST')"
          :inactive-text="$t('PUBLISH_UN_LIST')"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>
      <el-form-item
        prop="start_time"
        :label="`${$t('BANNER_MANAGEMENT_START_TIME')} :`"
        :label-position="isSmallScreen ? 'top' : 'right'"
      >
        <div class="flex space-x-2 w-full">
          <el-select v-model="formData.start_type" :clearable="false" :style="{ width: '120px' }">
            <el-option
              v-for="start in publicStartTypes"
              :key="start.value"
              :label="start.label"
              :value="start.value"
            />
          </el-select>
          <el-date-picker
            v-model="formData.start_time"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="false"
            class="flex-1"
            :readonly="formData.start_type === 1"
            @change="clearError('start_time')"
          />
        </div>
      </el-form-item>
      <el-form-item
        prop="end_time"
        :label="`${$t('BANNER_MANAGEMENT_END_TIME')} :`"
        :label-position="isSmallScreen ? 'top' : 'right'"
      >
        <div class="flex space-x-2 w-full">
          <el-select v-model="formData.end_type" :clearable="false" :style="{ width: '120px' }">
            <el-option
              v-for="end in publicEndTypes"
              :key="end.value"
              :label="end.label"
              :value="end.value"
            />
          </el-select>
          <el-date-picker
            v-model="formData.end_time"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :clearable="false"
            class="flex-1"
            :readonly="formData.end_type === 1"
            @change="clearError('end_time')"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer flex justify-center space-x-10">
        <el-button class="px-10" type="danger" @click="handleSubmit">
          {{ isEdit ? $t("BUTTON_EDIT") : $t("BUTTON_CREATE") }}
        </el-button>
        <el-button class="px-10" type="primary" @click="resetForm">
          {{ $t("BUTTON_RESET") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import BannerManagementAPI, {
  UpdateIpParam,
  BannerManagementVO,
  BannerManagementPageQuery,
} from "@/api/banner_management.api";
import { FormInstance } from "element-plus/es/components/form";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { usePublicEndTypes, usePublicStartTypes } from "@/utils/publicTypes";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { usePublicTypes } from "@/utils/banner";
import { appConfig } from "@/utils/config";

const { t, locale } = useI18n();
const async = ref(true);
const asyncMsg = ref("");
const activeName = ref(1);
const langs = ref<EnumVO[]>([] as EnumVO[]);
const gameModes = ref<EnumVO[]>([] as EnumVO[]);
const imageUploaderRef = ref();
const { setLoading } = useLoadingStore();
const publicTypes = ref(usePublicTypes(t));
// 新增 修改
const originalFormData = ref<UpdateIpParam | null>(null);
const formRef = ref<FormInstance>();
const isEdit = ref(false);
const isSubmit = ref(false);
const formData = ref<UpdateIpParam>({
  id: null,
  image_file: null,
  link_url: "",
  sort_order: 1,
  description: "",
  server_id: null,
  lang: 6,
  status: true,
  start_time: "",
  end_time: "",
  start_type: 1,
  end_type: 1,
  image_pic: null,
});

const dialog = reactive({
  title: "",
  visible: false,
});

const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  rules.image_file = [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("BANNER_MANAGEMENT_PIC_URL") }),
    },
  ];

  dialog.title = t("BANNER_MANAGEMENT_BANNER", { key: t("BUTTON_ADD") });
  dialog.visible = true;
};

function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

function onImageChange(file: File) {
  formData.value.image_file = file;
}

function resetForm() {
  if (formRef.value) {
    formRef.value.clearValidate();
  }
  imageUploaderRef.value?.resetFile();

  if (isEdit.value && originalFormData.value) {
    formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  } else {
    formData.value = {
      id: null,
      image_file: null,
      link_url: "",
      sort_order: 1,
      description: "",
      server_id: gameModes.value[0]?.id,
      lang: langs.value[0]?.id,
      status: true,
      start_type: 1,
      end_type: 1,
      start_time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      end_time: dayjs(appConfig.value.MAX_DATE_TIME).format("YYYY-MM-DD HH:mm:ss"),
      image_pic: null,
    };
  }
  clearAllCustomValidators(rules);
  isSubmit.value = false;
}

const rules = reactive<{ [key: string]: any[] }>({
  server_id: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("BANNER_MANAGEMENT_PIC_TYPE") }),
    },
  ],
  description: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("BANNER_MANAGEMENT_PIC_DESC") }),
    },
  ],
  sort_order: [
    {
      required: true,
    },
  ],
  lang: [
    {
      required: true,
    },
  ],
  status: [
    {
      required: true,
    },
  ],
  start_type: [
    {
      required: true,
    },
  ],
  end_type: [
    {
      required: true,
    },
  ],
});

const clearError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(formRef.value, rules, field);
  }
};

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(formData.value.id);
    const action = t(isUpdate ? "BUTTON_EDIT" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? BannerManagementAPI.update : BannerManagementAPI.create;

      const dataToSubmit = { ...formData.value };
      delete (dataToSubmit as any).start_type;
      delete (dataToSubmit as any).end_type;
      delete (dataToSubmit as any).image_pic;
      delete (dataToSubmit as any).image_url;
      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      } else {
        if (typeof (dataToSubmit as any).image_file === "string") {
          dataToSubmit.image_file = "";
        }
      }

      const multipart = new FormData();

      for (const key in dataToSubmit) {
        const value = (dataToSubmit as any)[key];
        if (value === null || value === undefined) continue;

        // ✅ 處理 boolean：Vue 的 switch 是 true/false，但後端可能期望是字串
        if (typeof value === "boolean") {
          multipart.append(key, value ? "true" : "false");
        } else {
          multipart.append(key, value);
        }
      }

      if (multipart["link_url"]?.length === 0) {
        multipart["link_url"] = null;
      }
      const { result, msg, errors } = await api(multipart);

      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(formRef.value, rules, errors);
        }
      } else {
        const message =
          t(result ? "MSG_ACTION_SUCCESS_MESSAGE" : "MSG_ACTION_FAIL_MESSAGE", { action }) +
          (result ? "" : ` message: ${msg}`);

        await ElMessageBox.alert(message, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      handleCloseDialog();
      handleQuery();
    } catch (error) {
      if (error === "cancel" || error === "close") return;
      const errorMessage = error instanceof Error ? error.message : String(error);

      ElMessageBox.alert(errorMessage, {
        type: "error",
        confirmButtonText: t("BUTTON_CLOSE"),
      });
    } finally {
      setLoading(false);
    }
  });
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
  publicTypes.value = usePublicTypes(t);
  updateDataTable({});
});
const total = ref(0);
const dataAry = ref<BannerManagementVO[]>([] as BannerManagementVO[]);
const queryParams = reactive<BannerManagementPageQuery>({
  start: 0,
  length: 10,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  lang: 1,
  server_id: null,
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
    server_id: null,
    status: null,
    search: "",
  });
};

const serverId = computed({
  get: () => {
    return queryParams.server_id ?? "";
  },
  set: (newValue) => {
    queryParams.server_id = newValue;
  },
});

const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

watch(activeName, () => {
  Object.assign(queryParams, { lang: activeName.value });
  handleQuery();
});

const getColumns = () => [
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "sort_order", title: t("BANNER_MANAGEMENT_SORT_ORDER"), className: "text-left!" },
  {
    data: "image_url",
    className: "text-center!",
    title: t("BANNER_MANAGEMENT_PIC_URL"),
    render: (data: string) => {
      return `<img src="${data}" alt="Banner" class="w-[300px] h-[100px] object-cover" />`;
    },
  },
  { data: "link_url", title: t("BANNER_MANAGEMENT_LINK_URL"), className: "text-left!" },
  { data: "description", title: t("BANNER_MANAGEMENT_PIC_DESC") },
  { data: "server_name", title: t("BANNER_MANAGEMENT_GAME_TYPE") },
  {
    data: "create_time",
    title: t("BANNER_MANAGEMENT_CREATE_TIME"),
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
    title: t("BANNER_MANAGEMENT_UPDATE_TIME"),
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
    data: "status",
    title: t("BANNER_MANAGEMENT_STATUS"),
    className: "text-center!",
    render: (data: string, _name: string, _row: BannerManagementVO) => {
      return `
              <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!_row.status_code ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
                ${data}
              </div>
            `;
    },
  },
  {
    data: "start_time",
    title: t("BANNER_MANAGEMENT_START_TIME"),
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
    title: t("BANNER_MANAGEMENT_END_TIME"),
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
    render: (_data: any, _name: any, row: BannerManagementVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field=""></div>`;
    },
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  checkSync();

  BannerManagementAPI.getAll(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ?? [];
        total.value = records_total;
      }
    })
    .catch(() => {
      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_BANNER_MANAGEMENT") })}`, {
        confirmButtonText: t("BUTTON_CONFIRM"),
      });
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: BannerManagementVO) => {
  setLoading(true);

  rules.image_file = [];

  BannerManagementAPI.get({ id: model.id })
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
          id: model.id,
          end_type: data.end_time == appConfig.value.MAX_DATE_TIME ? 1 : 0,
          start_type: 0,
          image_pic: data.image_url,
          image_file: data.image_url,
        });
        originalFormData.value = JSON.parse(
          JSON.stringify({
            ...data,
            status: data.status_code,
            id: model.id,
            end_type: data.end_time == appConfig.value.MAX_DATE_TIME ? 1 : 0,
            start_type: 0,
            image_pic: data.image_url,
            image_file: data.image_url,
          })
        );
        isEdit.value = true;
        dialog.title = t("BANNER_MANAGEMENT_BANNER", { key: t("BUTTON_UPDATE") });

        dialog.visible = true;
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
  BannerManagementAPI.delete({ id: data.id })
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
  BannerManagementAPI.sync()
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
function checkSync() {
  setLoading(true);
  BannerManagementAPI.checkSync()
    .then(({ result, msg }) => {
      async.value = result;
      asyncMsg.value = msg;
    })
    .finally(() => {
      setLoading(false);
    });
}

const isSmallScreen = ref(false);

const checkScreen = () => {
  isSmallScreen.value = window.innerWidth < 640; // 或你要的斷點，例如 768
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreen);
});

const getInitialData = async () => {
  setLoading(true);
  try {
    const [langOptions, gameMode] = await Promise.all([
      EnumAPI.get("GameLanguage"),
      EnumAPI.get("ServerId"),
    ]);

    langs.value = langOptions;
    gameModes.value = gameMode;
  } catch {
    getDataErrorAlert(t, "PAGE_BANNER_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  getInitialData();

  handleQuery();

  checkScreen();
  window.addEventListener("resize", checkScreen);
});
</script>
<style lang="scss" scoped>
.demo-tabs {
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
}
</style>
