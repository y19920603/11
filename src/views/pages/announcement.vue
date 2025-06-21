<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="ANNOUNCEMENT"></PageTitle>
  <div class="p-8">
    <el-tabs v-model="activeName" type="card" class="demo-tabs">
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
          :btnName="t('ANNOUNCEMENT_ANNOUNCE', { key: t('BUTTON_ADD') })"
          @add="addNewItem"
        >
          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>

      <template #searchFilter>
        <el-select
          v-model="statusType"
          :placeholder="$t('ANNOUNCEMENT_STATUS')"
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
          class="h-[40px]! min-w-[240px]"
          size="large"
          :placeholder="$t('ANNOUNCEMENT_TITLE')"
        ></el-input>
        <div class="flex space-x-2">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
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
      <el-form-item prop="category" :label="`${$t('ANNOUNCEMENT_CATEGORY')} :`">
        <el-select v-model="formData.category!" :clearable="false">
          <el-option
            v-for="item in categoryAry"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="title" :label="`${$t('ANNOUNCEMENT_TITLE')} :`">
        <el-input v-model="formData.title" @blur="clearError('title')" />
      </el-form-item>
      <el-form-item prop="image_file" :label="`${$t('ANNOUNCEMENT_IMAGE_URL')} :`">
        <ImageUploader
          ref="imageUploaderRef"
          :imagePic="formData.image_pic"
          @change="onImageChange"
        >
          <el-icon size="24"><UploadFilled /></el-icon>
          <div>{{ $t("BANNER_MANAGEMENT_UPLOAD_IMG") }}</div>
          <div class="text-red">
            *
            {{ $t("BANNER_MANAGEMENT_RECOMMENDED_SIZE_GAME") }}
          </div>
        </ImageUploader>
      </el-form-item>
      <el-form-item prop="s_text" :label="`${$t('ANNOUNCEMENT_S_TEXT')} :`">
        <el-input v-model="formData.s_text" @blur="clearError('s_text')" />
      </el-form-item>
      <el-form-item prop="link_url" :label="`${$t('ANNOUNCEMENT_LINK_URL')} :`">
        <el-input v-model="formData.link_url" @blur="clearError('link_url')" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item prop="sort_order" :label="`${$t('ANNOUNCEMENT_PRIORITY')} :`">
            <el-select v-model="formData.sort_order" :clearable="false">
              <el-option v-for="n in 10" :key="n" :label="n.toString()" :value="n" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="24" :md="12">
          <el-form-item prop="lang" :label="`${$t('ANNOUNCEMENT_LANG')} :`">
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
        :label="`${$t('ANNOUNCEMENT_START_TIME')} :`"
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
        :label="`${$t('ANNOUNCEMENT_END_TIME')} :`"
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
import AnnouncementAPI, {
  UpdateAnnouncementParam,
  AnnouncementVO,
  AnnouncementPageQuery,
} from "@/api/announcement.api";
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
const categoryAry = ref<EnumVO[]>([] as EnumVO[]);
const imageUploaderRef = ref();
const { setLoading } = useLoadingStore();
const publicTypes = ref(usePublicTypes(t));
// 新增 修改
const originalFormData = ref<UpdateAnnouncementParam | null>(null);
const formRef = ref<FormInstance>();
const isEdit = ref(false);
const isSubmit = ref(false);
const formData = ref<UpdateAnnouncementParam>({
  id: null,
  image_file: null,
  link_url: "",
  sort_order: 1,
  title: "",
  s_text: "",
  category: 1,
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
      message: t("MSG_REQUIRED", { field: t("ANNOUNCEMENT_IMAGE_URL") }),
    },
  ];

  dialog.title = t("ANNOUNCEMENT_ANNOUNCE", { key: t("BUTTON_ADD") });
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
  imageUploaderRef.value?.resetFile();

  if (isEdit.value && originalFormData.value) {
    formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  } else {
    formData.value = {
      id: null,
      image_file: null,
      link_url: "",
      sort_order: 1,
      title: "",
      s_text: "",
      category: 1,
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

  nextTick(() => {
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    }, 0);
  });
}

const rules = reactive<{ [key: string]: any[] }>({
  s_text: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("ANNOUNCEMENT_S_TEXT") }),
    },
  ],
  title: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("ANNOUNCEMENT_TITLE") }),
    },
  ],
  category: [
    {
      required: true,
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
      const api = isUpdate ? AnnouncementAPI.update : AnnouncementAPI.create;

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
const dataAry = ref<AnnouncementVO[]>([] as AnnouncementVO[]);
const queryParams = reactive<AnnouncementPageQuery>({
  start: 0,
  length: 10,
  sort: "create_time",
  sort_dir: 1,
  search: "",
  lang: 1,
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
  { data: "id_field", title: t("ANNOUNCEMENT_ID"), className: "text-left!" },
  { data: "sort_order", title: t("ANNOUNCEMENT_SORT_ORDER"), className: "text-left!" },
  {
    data: "category",
    title: t("ANNOUNCEMENT_CATEGORY"),
    className: "text-left!",
    render: (_data: string, _name: string, row: AnnouncementVO) => row.category_name,
  },
  { data: "title", title: t("ANNOUNCEMENT_TITLE") },
  { data: "s_text", title: t("ANNOUNCEMENT_S_TEXT") },
  {
    data: "image_url",
    className: "text-center!",
    title: t("ANNOUNCEMENT_IMAGE_URL"),
    sortable: false,
    render: (data: string) => {
      return `<img src="${data}" alt="Announcement" class="w-[300px] h-[100px] object-cover" />`;
    },
  },
  {
    data: "status",
    title: t("ANNOUNCEMENT_STATUS"),
    className: "text-center!",
    render: (data: string, _name: string, _row: AnnouncementVO) => {
      return `
              <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!_row.status_code ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
                ${data}
              </div>
            `;
    },
  },
  {
    data: "start_time",
    title: t("ANNOUNCEMENT_START_TIME"),
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
    title: t("ANNOUNCEMENT_END_TIME"),
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
    title: t("ANNOUNCEMENT_CREATE_TIME"),
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
    title: t("ANNOUNCEMENT_UPDATE_TIME"),
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
    title: t("ANNOUNCEMENT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: AnnouncementVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field="title"></div>`;
    },
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  checkSync();
  const queryData = { ...queryParams };
  if (queryData.sort === "id_field") {
    queryData.sort = "id";
  }
  AnnouncementAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_ANNOUNCEMENT") })}`, {
        confirmButtonText: t("BUTTON_CONFIRM"),
      });
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = (model: AnnouncementVO) => {
  setLoading(true);

  rules.image_file = [];

  AnnouncementAPI.get({ id: model.id })
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
        dialog.title = t("ANNOUNCEMENT_ANNOUNCE", { key: t("BUTTON_UPDATE") });
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
  AnnouncementAPI.delete({ id: data.id })
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
  AnnouncementAPI.sync()
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
  AnnouncementAPI.checkSync()
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
    const [langOptions, category] = await Promise.all([
      EnumAPI.get("GameLanguage"),
      EnumAPI.get("AnnouncementCategory"),
    ]);

    langs.value = langOptions;
    categoryAry.value = category;
  } catch {
    getDataErrorAlert(t, "PAGE_ANNOUNCEMENT");
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
