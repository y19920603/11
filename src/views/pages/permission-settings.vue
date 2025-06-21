<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="PERMISSION_SETTINGS"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :orderName="'id_field'"
      :orderDir="'asc'"
      @updateDataTable="updateDataTable"
      @editHandler="handleEdit"
      @deleteHandler="handleDelete"
    >
      <template #dateFilter>
        <AddNewItem
          :btnName="`${t('PERMISSION_SETTINGS_ADD_SETTINGS')}`"
          @add="handleCreate"
        ></AddNewItem>
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
          :width="240"
          :content="$t('PERMISSION_SETTINGS_SEARCH_POPOVER_CONTENT')"
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

        <SearchButtons @reset="resetSearch" @search="handleQuery" />
      </template>
    </DataTable>
  </div>

  <PermissionModal v-model:visible="showCreateModal" :edit-id="editId" @submitted="handleQuery" />
</template>
<script setup lang="ts">
import dayjs from "dayjs";

import PermissionAPI, { PermissionPageQuery, PermissionVO } from "@/api/permission_setting.api";
import PermissionModal from "@/views/pages/PermissionModal.vue";
import { useIncomeTypes } from "@/utils/incomeTypes";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";

const { t, locale } = useI18n();

const showCreateModal = ref(false);
const editId = ref();

const incomeTypes = ref(useIncomeTypes(t));

watch(locale, () => {
  columns.value = getColumns();
  incomeTypes.value = useIncomeTypes(t);
  updateDataTable({});
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<PermissionVO[]>([] as PermissionVO[]);
const queryParams = reactive<PermissionPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "id_field",
  sort_dir: 0,
  search: null,
  income_type: null,
  role_id: null,
});

const roles = ref<EnumVO[]>([]);

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

const updateDataTable = (data: any) => {
  Object.assign(queryParams, data);
  handleQuery();
};

const getColumns = () => [
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "id_field", title: t("ANNOUNCEMENT_ID"), className: "text-left!" },
  { data: "name", title: t("PERMISSION_SETTINGS_NAME") },
  { data: "role", title: t("PERMISSION_SETTINGS_ROLE") },
  { data: "user_qty", title: t("PERMISSION_SETTINGS_USER_QTY") },
  { data: "create_time", title: t("PERMISSION_SETTINGS_CREATE_TIME") },
  {
    data: "modules",
    title: t("PERMISSION_SETTINGS_MODULES"),
    orderable: false,
    render: (data: string[]) => {
      if (!Array.isArray(data)) return "";
      return data
        .map((item) => {
          return `<span class="inline-block m-1 px-2 py-1 rounded-full bg-green-700 text-white text-xs">${item}</span>`;
        })
        .join("");
    },
  },
  {
    data: "",
    title: t("PERMISSION_SETTINGS_EDIT"),
    className: "text-center!",
    orderable: false,
    render: (_data: any, _type: any, row: any) => {
      return `<div class="action-buttons" data-id="${row.id}" data-name="${row.name}" data-field="role,name"></div>`;
    },
  },
];
const columns = ref(getColumns());

const handleEdit = (model: PermissionVO) => {
  // 設定 editId，觸發 Modal 載入資料
  editId.value = model.id;
  showCreateModal.value = true;
};

const handleDelete = (model: PermissionVO) => {
  ElMessageBox.confirm(`${t("MSG_DELETE_CONFIRM", { name: model.name })}`, t("BUTTON_DELETE"), {
    confirmButtonText: t("BUTTON_CONFIRM"),
    cancelButtonText: t("BUTTON_CANCEL"),
    type: "warning",
  })
    .then(async () => {
      setLoading(true);
      const { result, msg } = await PermissionAPI.deletePermissionGroup(model.id);

      ElMessageBox.alert(
        `${t(result ? "MSG_ACTION_SUCCESS_MESSAGE" : "MSG_ACTION_FAIL_MESSAGE", {
          action: t("BUTTON_DELETE"),
        })} ${result ? "" : `message: ${msg}`}`,
        {
          confirmButtonText: t("BUTTON_CONFIRM"),
        }
      );

      if (result) handleQuery();
    })
    .catch(() => {
      /* 使用者點取消不處理 */
    })
    .finally(() => {
      setLoading(false);
    });
};

function handleCreate() {
  editId.value = null; // ✅ 清空編輯 ID → 切換為「新增模式」
  showCreateModal.value = true; // ✅ 開啟 Modal
}

function handleQuery() {
  setLoading(true);
  const queryData = { ...queryParams };
  if (queryData.sort === "id_field") {
    queryData.sort = "id";
  }

  PermissionAPI.getPermissionData(queryData)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id_field: e.id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_PERMISSION_SETTINGS") })}`);
    })
    .finally(() => {
      setLoading(false);
    });
}
onMounted(async () => {
  handleQuery();
  // 載入權限群組 Enum
  try {
    roles.value = await EnumAPI.get("Role");
  } catch {
    roles.value = [];
  }
});
</script>
