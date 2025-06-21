<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="AGENT_DEPOSIT"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      :orderName="'agent_id'"
      @updateDataTable="updateDataTable"
    >
      <template #searchFilter>
        <div class="space-y-2 xl:flex xl:space-x-2 xl:space-y-0 mb-2 2xl:mb-0">
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

          <SearchButtons :resetBtn="false" @search="updateDataTable" />
        </div>
      </template>
    </DataTable>
  </div>

  <template v-if="changeDeposit">
    <el-dialog
      v-model="showChangeDepositDialog"
      :title="changeDeposit.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="changeDepositCloseHandler"
    >
      <el-form
        ref="changeDepositFormRef"
        :model="changeDeposit"
        :rules="changeDepositRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item :label="$t('AGENT_DEPOSIT_COMPANY_NAME')">
          <el-input v-model="changeDeposit.agent_name" readonly />
        </el-form-item>
        <el-form-item :label="$t('AGENT_DEPOSIT_THRESHOLD')">
          <el-input v-model="changeDeposit.warning_threshold" readonly />
        </el-form-item>
        <el-form-item :label="$t('AGENT_DEPOSIT_DEPOSIT')">
          <div
            class="border border-[gray] w-full rounded px-2 text-center text-blue-500"
            :class="{ 'text-red-500': changeDeposit.new_deposit < 0 }"
          >
            {{ changeDeposit.new_deposit }}
          </div>
        </el-form-item>
        <el-form-item prop="value" :label="$t('AGENT_DEPOSIT_ADJUST_DEPOSIT')">
          <el-input-number v-model="changeDeposit.value" class="w-full!" type="number" :step="1" />
        </el-form-item>

        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="changeDeposit.password"
            show-password
            type="password"
            @blur="clearChangeDepositError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="changeDepositCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="changeDepositSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
</template>
<script setup lang="ts">
import $ from "jquery";
import AgentDepositAPI, { AgentDepositPageQuery, AgentDepositVO } from "@/api/agent_deposit.api";
import { useLoadingStore } from "@/store";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { getDataErrorAlert } from "@/utils/message";
import { FormInstance, FormRules } from "element-plus";
import AuthAPI from "@/api/auth.api";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});
const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<AgentDepositVO[]>([] as AgentDepositVO[]);
const queryParams = reactive<AgentDepositPageQuery>({
  start: 0,
  length: 25,
  sort: "agent_id",
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
  { data: "agent_id", title: t("AGENT_DEPOSIT_ID"), className: "text-left!" },
  { data: "agent_name", title: t("AGENT_DEPOSIT_AGENT_NAME") },
  { data: "company_name", title: t("AGENT_DEPOSIT_COMPANY_NAME") },
  { data: "deposit", title: t("AGENT_DEPOSIT_DEPOSIT") },
  {
    data: "warning_threshold",
    title: t("AGENT_DEPOSIT_OPERATE"),
    className: "text-center!",
    sortable: false,
    render: (_data: any, _name: any, row: AgentDepositVO) =>
      `<div class="w-max m-auto rounded-full py-2 px-6 edit-button cursor-pointer text-white bg-[#5b73e8] hover:bg-[#4d62c5]"
        data-row='${JSON.stringify(row)}'
      >
        ${t("BUTTON_EDIT")}
      </div>`,
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  AgentDepositAPI.get(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data ? data.map((e) => ({ ...e, id: e.agent_id })) : [];
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_AGENT_DEPOSIT");

      ElMessageBox.alert(`${t("MSG_GET_DATA_FAIL", { page: t("PAGE_AGENT_DEPOSIT") })}`, {
        confirmButtonText: t("BUTTON_CONFIRM"),
      });
    })
    .finally(() => {
      setLoading(false);
    });
}

// agent change deposit
const isSubmit = ref(false);
const clearChangeDepositError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(changeDepositFormRef.value, changeDepositRules, field);
  }
};
const changeDepositSaveHandler = async () => {
  if (!changeDepositFormRef.value) return;

  await changeDepositFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...changeDeposit.value };

      const { result, errors, msg } = await AgentDepositAPI.addDeposit({
        agent_id: dataToSubmit.agent_id!,
        add_deposit: dataToSubmit.value!,
        password: encrypt.encrypt(dataToSubmit.password!) as string,
      });
      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(changeDepositFormRef.value, changeDepositRules, errors);
        }
        return;
      }

      try {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      } finally {
        changeDepositCloseHandler();
        handleQuery();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const changeDepositCloseHandler = () => {
  changeDeposit.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(changeDepositRules);
};
const showChangeDepositDialog = computed(
  () => (changeDeposit.value && changeDeposit.value.show) ?? false
);
const changeDeposit = ref<null | {
  agent_id: number;
  show: boolean;
  title: string;
  agent_name: string;
  company_name: string;
  old_deposit: number;
  new_deposit: number;
  warning_threshold: string;
  password: string;
  value: number;
}>(null);
watch(
  () => changeDeposit.value?.value,
  (newVal) => {
    if (changeDeposit.value) {
      changeDeposit.value.new_deposit = changeDeposit.value.old_deposit + newVal!;
    }
  },
  { immediate: true }
);
const changeDepositFormRef = ref<FormInstance>();
const changeDepositRules: FormRules = reactive({
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
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .edit-button`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .edit-button`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        const element = this as HTMLDivElement;
        const row = $(element).data("row");
        changeDeposit.value = {
          agent_id: row.agent_id,
          agent_name: row.agent_name,
          company_name: row.company_name,
          password: "",
          show: true,
          title: `${t("AGENT_DEPOSIT_OPERATE")}(${row.agent_name})`,
          old_deposit: parseFloat(row.deposit.replaceAll(",", "")),
          new_deposit: 0,
          warning_threshold: row.warning_threshold,
          value: 0,
        };
      }
    );
};

onMounted(() => {
  handleQuery();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
