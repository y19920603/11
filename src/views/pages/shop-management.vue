<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="SHOP_MANAGEMENT"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
      @editHandler="handleEdit"
    >
      <template #dateFilter>
        <AddNewItem
          :btnName="`${t('SHOP_MANAGEMENT_SHOP', { key: t('BUTTON_ADD') })}`"
          @add="addNewItem"
        >
          <template #goImgUpload>
            <router-link v-slot="{ navigate }" to="/shopicon-list" custom>
              <button
                class="h-[40px] text-sm flex justify-center items-center px-6 py-3 rounded-full bg-[#34c38f] flex justify-center items-center text-14px flex-1 2xl:flex-initial cursor-pointer whitespace-nowrap text-white"
                role="link"
                @click="navigate"
              >
                {{ t("SHOP_MANAGEMENT_GOTO_IMAGE_UPLOAD") }}
              </button>
            </router-link>
          </template>

          <SyncButton :async="async" :asyncMsg="asyncMsg" @async="asyncData" />
        </AddNewItem>
      </template>

      <template #searchFilter>
        <el-select
          v-model="statusType"
          :placeholder="$t('SHOP_MANAGEMENT_STATUS')"
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
          :placeholder="$t('SHOP_MANAGEMENT_ITEM_NAME')"
        ></el-input>
        <div class="flex space-x-2">
          <SearchButtons @reset="resetSearch" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>

  <ShopManagementDialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    v-model:formData="formData"
    :title="dialogTitle"
    :isEdit="isEdit"
    :shopOptions="shopOptions"
    :goldOptions="goldOptions"
    :shopIconOptions="shopIconOptions"
    @handleCloseDialog="closeDialog"
    @resetForm="resetForm"
  />
</template>
<script setup lang="ts">
import ShopManagementAPI, {
  ShopManagementPageQuery,
  ShopManagementVO,
  UpdateShopManagementParam,
} from "@/api/shop_management.api";
import { actionErrorAlert, actionResultAlert, getDataErrorAlert } from "@/utils/message";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { appConfig } from "@/utils/config";
import { usePublicTypes } from "@/utils/banner";
import ShopIconListAPI, { ShopIconOption } from "@/api/shop_icon_list.api";
import getGoldImg from "@/utils/goldImg";

const dialogVisible = ref(false);
const dialogTitle = ref("");
const originalFormData = ref<UpdateShopManagementParam | null>(null);
const closeDialog = (reQuery: boolean = false) => {
  originalFormData.value = null;
  dialogVisible.value = false;
  if (reQuery) {
    handleQuery();
  }
};

const { t, locale } = useI18n();
const shopOptions = ref<EnumVO[]>([] as EnumVO[]);
const goldOptions = ref<EnumVO[]>([] as EnumVO[]);
const shopIconOptions = ref<ShopIconOption[]>([] as ShopIconOption[]);
const { setLoading } = useLoadingStore();
const publicTypes = ref(usePublicTypes(t));
// 新增 修改
const isEdit = ref(false);

// formData
const formData = ref<UpdateShopManagementParam>(getEmptyFormData());
function getEmptyFormData(): UpdateShopManagementParam {
  return {
    id: null,
    item_type_id: 1,
    item_name: "",
    item_desc: "",
    icon_id: shopIconOptions.value[0]?.id,
    gold_type: 1,
    gold: "",
    status: true,
    discount_fl: false,
    discount_gold: null,
    buy_gold: "",
    give_gold: null,
    start_time: "",
    end_time: "",
    always_discount: false,
    item_code: "",
  };
}

const addNewItem = async () => {
  await getInitialData();
  isEdit.value = false;
  resetForm();
  dialogTitle.value = t("SHOP_MANAGEMENT_SHOP", { key: t("BUTTON_ADD") });
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

// 列表
watch(locale, () => {
  columns.value = getColumns();
  publicTypes.value = usePublicTypes(t);
  updateDataTable({});
});
const total = ref(0);
const dataAry = ref<ShopManagementVO[]>([] as ShopManagementVO[]);
const queryParams = reactive<ShopManagementPageQuery>({
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
  { data: "item_code", title: t("SHOP_MANAGEMENT_ITEM_CODE") },
  {
    data: "icon_url",
    title: t("SHOP_MANAGEMENT_ICON_URL"),
    className: "text-center!",
    render: (data: string, _name: string) => {
      if (_name === "sort" || _name === "type") return data;
      return `<img src="${data}" alt="Shop" class="w-[60px] h-[60px] object-cover" />`;
    },
  },
  { data: "item_name", title: t("SHOP_MANAGEMENT_ITEM_NAME") },
  { data: "item_desc", title: t("SHOP_MANAGEMENT_ITEM_DESC") },
  {
    data: "status",
    title: t("SHOP_MANAGEMENT_STATUS"),
    className: "text-center!",
    render: (data: boolean, _name: string, _row: ShopManagementVO) => {
      return `
              <div class="rounded-full w-fit px-5 py-1 m-auto text-center ${!data ? "bg-[--bg-error] text-[--text-error]" : "bg-[--bg-success] text-[--text-success]"}" >
                ${_row.status_name}
              </div>
            `;
    },
  },
  {
    data: "item_type_name",
    title: t("SHOP_MANAGEMENT_ITEM_TYPE"),
  },
  {
    data: "buy_gold",
    title: t("SHOP_MANAGEMENT_BUY_GOLD"),
    className: "text-right",
  },
  {
    data: "give_gold",
    title: t("SHOP_MANAGEMENT_GIVE_GOLD"),
    className: "text-right",
  },
  {
    data: "discount_gold",
    title: t("SHOP_MANAGEMENT_DISCOUNT_GOLD"),
    className: "text-right",
  },
  {
    data: "gold",
    title: t("SHOP_MANAGEMENT_GOLD"),
    className: "text-right",
  },
  {
    data: "gold_type",
    title: t("SHOP_MANAGEMENT_GOLD_TYPE"),
    className: "text-center!",
    render: (data: number, _name: string, row: ShopManagementVO) => {
      if (_name === "sort" || _name === "type") return data;

      let html = "";
      switch (data) {
        case 0:
        case 1:
        case 2:
        case 3:
          html = `<div class="text-center"><img src="${getGoldImg(data.toString())}" alt="" height="35px" width="35px" />
                    <div>${row.gold_type_name ?? ""}</div></div>`;
          break;
        default:
          html = `<div class="text-center">${row.gold_type_name ?? row.gold_type}</div>`;
          break;
      }
      return html;
    },
  },
  {
    data: "start_time",
    title: t("SHOP_MANAGEMENT_START_TIME"),
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
    title: t("SHOP_MANAGEMENT_END_TIME"),
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
    title: t("SHOP_MANAGEMENT_CREATE_TIME"),
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
    title: t("SHOP_MANAGEMENT_UPDATE_TIME"),
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
    title: t("SHOP_MANAGEMENT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: ShopManagementVO) => {
      return `<div class="action-buttons" data-id="${row.id}" data-field=""  data-delete="false"></div>`;
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
  ShopManagementAPI.getAll(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_SHOP_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });
}

// 編輯按鈕
const handleEdit = async (model: ShopManagementVO) => {
  setLoading(true);
  await getInitialData();
  ShopManagementAPI.get({ id: model.id })
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
          always_discount: data.end_time === appConfig.value.MAX_DATE_TIME,
        });
        originalFormData.value = JSON.parse(
          JSON.stringify({
            ...data,
            id: model.id,
            always_discount: data.end_time === appConfig.value.MAX_DATE_TIME,
          })
        );
        isEdit.value = true;
        resetForm();
        dialogTitle.value = t("DIALOG_TITLE", {
          action: t("BUTTON_UPDATE"),
          key: t("SHOP_MANAGEMENT_SHOP"),
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

// 同步按鈕
const asyncData = () => {
  setLoading(true);
  ShopManagementAPI.sync()
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
  ShopManagementAPI.checkSync()
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
    const [shopItemOptions, goldTypeOptions, shipIconResult] = await Promise.all([
      EnumAPI.get("ShopItemType"),
      EnumAPI.get("GoldType"),
      ShopIconListAPI.options(),
    ]);

    shopOptions.value = shopItemOptions;
    goldOptions.value = goldTypeOptions;
    shopIconOptions.value = shipIconResult.data;
  } catch {
    getDataErrorAlert(t, "PAGE_SHOP_MANAGEMENT");
  } finally {
    setLoading(false);
  }
};

onMounted(() => {
  handleQuery();
});
</script>
