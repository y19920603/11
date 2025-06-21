<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="SHOP_ICON_LIST"></PageTitle>
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
        <AddNewItem
          :btnName="`${t('SHOP_ICON_LIST_SHOP_ICON', { key: t('BUTTON_ADD') })}`"
          @add="addNewItem"
        />
      </template>

      <template #searchFilter>
        <div class="space-y-2 xl:flex xl:space-x-2 xl:space-y-0 mb-2 2xl:mb-0">
          <el-input
            v-model="queryParams.search"
            class="h-[40px]! min-w-[220px]"
            :placeholder="$t('SHOP_ICON_LIST_ICON_NAME')"
          ></el-input>

          <SearchButtons :resetBtn="false" @search="updateDataTable" />
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
      label-position="top"
    >
      <div class="flex flex-col md:flex-row">
        <div>
          <el-form-item prop="icon_name" :label="`${$t('SHOP_ICON_LIST_ICON_NAME')} :`">
            <el-input v-model="formData.icon_name" @blur="clearError('icon_name')" />
          </el-form-item>
          <el-form-item
            prop="default_fl"
            :label="`${$t('SHOP_ICON_LIST_DEFAULT_FL')} :`"
            class="flex items-center"
          >
            <el-switch
              v-model="formData.default_fl"
              size="large"
              width="60"
              inline-prompt
              :active-text="'ON'"
              :inactive-text="'OFF'"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-[240px] mx-auto">
          <el-form-item prop="image_file">
            <ImageUploader
              ref="imageUploaderRef"
              :imagePic="formData.image_pic"
              @change="onImageChange"
            >
              <el-icon size="24"><UploadFilled /></el-icon>
              <div>{{ $t("BANNER_MANAGEMENT_UPLOAD_IMG") }}</div>
              <div class="text-red">
                *
                {{ $t("SHOP_ICON_LIST_RECOMMENDED_SIZE_") }}
              </div>
            </ImageUploader>
          </el-form-item>
        </div>
      </div>
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
import ShopIconListAPI, {
  ShopIconListPageQuery,
  ShopIconListVO,
  UpdateShopIconParam,
} from "@/api/shop_icon_list.api";
import { useLoadingStore } from "@/store";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";

const { t, locale } = useI18n();
const imageUploaderRef = ref();
const isEdit = ref(false);
const isSubmit = ref(false);
const originalFormData = ref<UpdateShopIconParam | null>(null);
const formRef = ref<FormInstance>();
const formData = ref<UpdateShopIconParam>({
  id: null,
  image_file: null,
  icon_name: "",
  default_fl: true,
  image_pic: null,
});

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});
const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<ShopIconListVO[]>([] as ShopIconListVO[]);

const dialog = reactive({
  title: "",
  visible: false,
});

const clearError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(formRef.value, rules, field);
  }
};

function onImageChange(file: File) {
  formData.value.image_file = file;
  clearError("image_file");
}

const addNewItem = () => {
  isEdit.value = false;
  resetForm();
  rules.image_file = [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_ICON_LIST_ICON_URL") }),
    },
  ];

  dialog.title = t("SHOP_ICON_LIST_SHOP_ICON", { key: t("BUTTON_ADD") });
  dialog.visible = true;
};

function resetForm() {
  imageUploaderRef.value?.resetFile();

  if (isEdit.value && originalFormData.value) {
    formData.value = JSON.parse(JSON.stringify(originalFormData.value));
  } else {
    formData.value = {
      id: null,
      image_file: null,
      icon_name: "",
      default_fl: true,
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
  icon_name: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_ICON_LIST_ICON_NAME") }),
    },
  ],
  default_fl: [
    {
      required: true,
    },
  ],
});

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(formData.value.id);
    const action = t(isUpdate ? "BUTTON_EDIT" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? ShopIconListAPI.update : ShopIconListAPI.create;

      const dataToSubmit = { ...formData.value };
      delete (dataToSubmit as any).icon_url;
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

function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

const queryParams = reactive<ShopIconListPageQuery>({
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: null,
});

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
  { data: "id_field", title: t("SHOP_ICON_LIST_ID"), className: "text-left!" },
  {
    data: "default_fl",
    title: t("SHOP_ICON_LIST_DEFAULT_FL"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: ShopIconListVO) => {
      return `
          <div class="rounded-full w-fit px-5 py-1 m-auto  text-center  ${!data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
            ${_row.default_fl_name ?? data}
          </div>
        `;
    },
  },
  {
    data: "icon_name",
    title: t("SHOP_ICON_LIST_ICON_NAME"),
    type: "zh-tw-string",
  },
  {
    data: "icon_url",
    title: t("SHOP_ICON_LIST_ICON_URL"),
    className: "text-center!",
    render: (data: string, _name: string) => {
      if (_name === "sort" || _name === "type") return data;
      return `<img src="${data}" alt="Shop" class="w-[60px] h-[60px] object-cover" />`;
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
    title: t("SHOP_ICON_LIST_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: ShopIconListVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field="icon_name"></div>`;
    },
  },
];
const columns = ref(getColumns());

// 刪除按鈕
const handleDelete = (data: any) => {
  setLoading(true);
  ShopIconListAPI.delete({ id: data.id })
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

// 編輯按鈕
const handleEdit = (model: ShopIconListVO) => {
  setLoading(true);

  rules.image_file = [];

  ShopIconListAPI.get({ id: model.id })
    .then(({ result, msg, data }) => {
      if (!result) {
        ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: `${model.id}` })}, message: ${msg}`, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
        return;
      } else {
        Object.assign(formData.value, {
          ...data,
          id: model.id,
          image_pic: data.icon_url,
          image_file: data.icon_url,
        });
        originalFormData.value = JSON.parse(
          JSON.stringify({
            ...data,
            id: model.id,
            image_pic: data.icon_url,
            image_file: data.icon_url,
          })
        );
        isEdit.value = true;
        dialog.title = t("SHOP_ICON_LIST_SHOP_ICON", { key: t("BUTTON_UPDATE") });

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

function handleQuery() {
  setLoading(true);

  const queryData = { ...queryParams };
  if (queryData.sort === "id_field") {
    queryData.sort = "id";
  }

  ShopIconListAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_SHOP_ICON_LIST");

      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_SHOP_ICON_LIST") })}`, {
        confirmButtonText: t("BUTTON_CONFIRM"),
      });
    })
    .finally(() => {
      setLoading(false);
    });
}

onMounted(() => {
  handleQuery();
});
</script>
