<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <!-- 總代理 -->
      <el-form-item prop="ga_id" :label="$t('AGENT_ACCOUNT_MANAGEMENT_GA_NAME')">
        <el-select
          v-model="formData.ga_id"
          filterable
          clearable
          :placeholder="$t('AGENT_ACCOUNT_MANAGEMENT_PLACEHOLDER_SELECT')"
        >
          <el-option
            v-for="item in gaOptions"
            :key="item.id"
            :label="`${item.ga_name}（${item.ga_company_name}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 代理帳號 -->
      <el-form-item prop="agent_name" :label="$t('AGENT_ACCOUNT_MANAGEMENT_AGENT_NAME')">
        <el-input
          v-model="formData.agent_name"
          :placeholder="
            $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('AGENT_ACCOUNT_MANAGEMENT_AGENT_NAME') })
          "
          :disabled="isEdit"
          @blur="clearError('agent_name')"
        />
      </el-form-item>

      <!-- 公司名稱 -->
      <el-form-item prop="company_name" :label="$t('AGENT_ACCOUNT_MANAGEMENT_COMPANY_NAME')">
        <el-input
          v-model="formData.company_name"
          :placeholder="
            $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('AGENT_ACCOUNT_MANAGEMENT_COMPANY_NAME') })
          "
          @blur="clearError('company_name')"
        />
      </el-form-item>

      <!-- 業務聯絡人 -->
      <el-form-item prop="business_contact" :label="$t('AGENT_ACCOUNT_MANAGEMENT_BUSINESS')">
        <el-input v-model="formData.business_contact" @blur="clearError('business_contact')" />
      </el-form-item>

      <!-- 技術聯絡人 -->
      <el-form-item prop="tech_contact" :label="$t('AGENT_ACCOUNT_MANAGEMENT_TECH')">
        <el-input v-model="formData.tech_contact" @blur="clearError('tech_contact')" />
      </el-form-item>

      <!-- 語系 -->
      <el-form-item prop="lang" :label="$t('AGENT_ACCOUNT_MANAGEMENT_LANG')">
        <el-select v-model="formData.lang" filterable :clearable="false">
          <el-option
            v-for="lang in langOptions"
            :key="lang.id"
            :label="lang.name"
            :value="lang.id"
          />
        </el-select>
      </el-form-item>

      <!-- 抽水比例 -->
      <el-form-item prop="rake" :label="$t('AGENT_ACCOUNT_MANAGEMENT_RAKE')">
        <div class="w-full flex space-x-2">
          <el-input v-model="formData.rake" type="number" step="0.01" @blur="clearError('rake')" />
          <span>%</span>
        </div>
      </el-form-item>

      <!-- 金幣拆帳 -->
      <el-form-item prop="gold_split" :label="$t('AGENT_ACCOUNT_MANAGEMENT_GOLD_SPLIT')">
        <div class="w-full flex space-x-2">
          <el-input
            v-model="formData.gold_split"
            type="number"
            step="0.01"
            @blur="clearError('gold_split')"
          />
          <span>%</span>
        </div>
      </el-form-item>

      <!-- EV 拆帳 -->
      <el-form-item prop="ev_split" :label="$t('AGENT_ACCOUNT_MANAGEMENT_EV_SPLIT')">
        <div class="w-full flex space-x-2">
          <el-input
            v-model="formData.ev_split"
            type="number"
            step="0.01"
            @blur="clearError('ev_split')"
          />
          <span>%</span>
        </div>
      </el-form-item>

      <!-- 商城拆帳 -->
      <el-form-item prop="shop_split" :label="$t('AGENT_ACCOUNT_MANAGEMENT_SHOP_SPLIT')">
        <div class="w-full flex space-x-2">
          <el-input
            v-model="formData.shop_split"
            type="number"
            step="0.01"
            @blur="clearError('shop_split')"
          />
          <span>%</span>
        </div>
      </el-form-item>

      <!-- 私人房主分成 -->
      <el-form-item prop="master_split" :label="$t('AGENT_ACCOUNT_MANAGEMENT_MASTER_SPLIT')">
        <div class="w-full flex space-x-2">
          <el-input
            v-model="formData.master_split"
            type="number"
            step="0.01"
            max="50"
            @blur="clearError('master_split')"
          />
          <span>%</span>
        </div>
      </el-form-item>

      <!-- 警示門檻 -->
      <el-form-item
        prop="warning_threshold"
        :label="$t('AGENT_ACCOUNT_MANAGEMENT_WARNING_THRESHOLD')"
      >
        <el-input-number
          v-model="formData.warning_threshold"
          :min="0"
          :controls="false"
          class="w-full"
          @blur="clearError('warning_threshold')"
        />
      </el-form-item>

      <!-- 是否凍結 -->
      <el-form-item prop="freeze_fl" :label="$t('AGENT_ACCOUNT_MANAGEMENT_FREEZE_FL')">
        <el-switch
          v-model="formData.freeze_fl"
          width="80"
          inline-prompt
          :active-text="$t('SWITCH_OPEN')"
          :inactive-text="$t('SWITCH_CLOSE')"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>

      <!-- 是否加入公海 -->
      <el-form-item prop="join_sea_fl" :label="$t('AGENT_ACCOUNT_MANAGEMENT_JOIN_SEA_FL')">
        <el-switch
          v-model="formData.join_sea_fl"
          width="80"
          inline-prompt
          :active-text="$t('SWITCH_OPEN')"
          :inactive-text="$t('SWITCH_CLOSE')"
          :active-value="true"
          :inactive-value="false"
        />
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
import AgentAccountManagementAPI, {
  UpdateAgentAccountParam,
} from "@/api/agent-account_management.api";
import { EnumVO } from "@/api/enum.api";
import { AgentOption } from "@/api/ga_account_management.api";
import { useLoadingStore } from "@/store";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateAgentAccountParam;
  isEdit: boolean;
  gaOptions: AgentOption[];
  langOptions: EnumVO[];
}>();

const emit = defineEmits(["resetForm", "handleCloseDialog"]);

const { setLoading } = useLoadingStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const isSubmit = ref(false);

const handleClose = () => {
  emit("handleCloseDialog");
};

const clearError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(formRef.value, rules, field);
  }
};

const resetForm = () => {
  clearAllCustomValidators(rules);

  isSubmit.value = false;
  nextTick(() => {
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    }, 0);
  });
  emit("resetForm");
};

// 表單欄位驗證規則
const rules = reactive<{ [key: string]: any[] }>({
  company_name: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_COMPANY_NAME") }),
      trigger: "blur",
    },
  ],
  ga_id: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_GA_NAME") }),
      trigger: "blur",
    },
  ],

  gold_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_GOLD_SPLIT") }),
      trigger: "blur",
    },
  ],
  shop_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_SHOP_SPLIT") }),
      trigger: "blur",
    },
  ],
  ev_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_EV_SPLIT") }),
      trigger: "blur",
    },
  ],
  freeze_fl: [
    {
      required: true,
    },
  ],
  rake: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_RAKE") }),
      trigger: "blur",
    },
  ],

  master_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_MASTER_SPLIT") }),
      trigger: "blur",
    },
    {
      min: 0,
      max: 50,
      message: t("PLAYER_MEMBER_MANAGEMENT_SEARCH_HINT"),
      trigger: "blur",
    },
  ],

  warning_threshold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_WARNING_THRESHOLD") }),
      trigger: "blur",
    },
  ],
  join_sea_fl: [
    {
      required: true,
    },
  ],
  lang: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_LANG") }),
      trigger: "change",
    },
  ],
});

watch(
  () => props.isEdit,
  (newValue) => {
    if (newValue) {
      rules.agent_name = [];
    } else {
      rules.agent_name = [
        {
          required: true,
          message: t("MSG_NOT_EMPTY", { key: t("AGENT_ACCOUNT_MANAGEMENT_AGENT_NAME") }),
          trigger: "blur",
        },
        {
          pattern: /^\d{5}$/,
          message: t("MSG_INVALID_FORMAT", { format: t("MSG_AGENT_NAME_FORMAT") }),
          trigger: "blur",
        },
      ];
    }
  },
  {
    immediate: true,
  }
);

// 提交新增/編輯表單
async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_EDIT" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? AgentAccountManagementAPI.update : AgentAccountManagementAPI.create;

      const dataToSubmit = { ...props.formData };
      delete (dataToSubmit as any).del_fl;
      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      }

      const { result, msg, errors } = await api(dataToSubmit);

      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(formRef.value, rules, errors);
        }
      }

      // 不論成功或失敗都會顯示 msg
      const message =
        t(result ? "MSG_ACTION_SUCCESS_MESSAGE" : "MSG_ACTION_FAIL_MESSAGE", { action }) +
        (msg ? `<br>message: ${msg}` : "");

      await ElMessageBox.alert(message, {
        confirmButtonText: t("BUTTON_CONFIRM"),
        dangerouslyUseHTMLString: true,
      });

      if (!result) {
        return;
      }

      emit("handleCloseDialog", true);
    } catch (error) {
      // ✅ 忽略使用者關閉對話框的行為
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
</script>
