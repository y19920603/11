<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item prop="ga_name">
        <template #label>
          {{ $t("GA_ACCOUNT_MANAGEMENT_AGENT_NAME") }}
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="$t('MSG_GA_NAME_FORMAT')"
            placement="right"
          >
            <el-icon class="text-red relative top-[3px] cursor-pointer">
              <WarningFilled />
            </el-icon>
          </el-tooltip>
        </template>
        <el-input
          v-model="formData.ga_name"
          :placeholder="
            $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('GA_ACCOUNT_MANAGEMENT_AGENT_NAME') })
          "
          :disabled="isEdit"
          @blur="clearError('ga_name')"
        />
      </el-form-item>
      <el-form-item prop="ga_company_name" :label="$t('GA_ACCOUNT_MANAGEMENT_COMPANY_NAME')">
        <el-input
          v-model="formData.ga_company_name"
          :disabled="isEdit"
          :placeholder="
            $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('GA_ACCOUNT_MANAGEMENT_COMPANY_NAME') })
          "
          @blur="clearError('ga_company_name')"
        />
      </el-form-item>
      <el-form-item prop="business_contact" :label="$t('GA_ACCOUNT_MANAGEMENT_BUSINESS')">
        <el-input v-model="formData.business_contact" @blur="clearError('business_contact')" />
      </el-form-item>
      <el-form-item prop="tech_contact" :label="$t('GA_ACCOUNT_MANAGEMENT_TECH')">
        <el-input v-model="formData.tech_contact" @blur="clearError('tech_contact')" />
      </el-form-item>
      <el-form-item prop="gold_split" :label="$t('GA_ACCOUNT_MANAGEMENT_GOLD_SPLIT')">
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
      <el-form-item prop="shop_split" :label="$t('GA_ACCOUNT_MANAGEMENT_SHOP_SPLIT')">
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
      <el-form-item prop="ev_split" :label="$t('GA_ACCOUNT_MANAGEMENT_EV_SPLIT')">
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
      <el-form-item prop="freeze_fl" :label="$t('GA_ACCOUNT_MANAGEMENT_FREEZE_FL')">
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
    </el-form>

    <template #footer>
      <div class="dialog-footer flex justify-center space-x-10">
        <el-button class="px-10" type="danger" @click="handleSubmit">
          {{ isEdit ? $t("BUTTON_UPDATE") : $t("BUTTON_CREATE") }}
        </el-button>
        <el-button class="px-10" type="primary" @click="resetForm">
          {{ $t("BUTTON_RESET") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import GaAccountManagementAPI, { UpdateGaAccountParam } from "@/api/ga_account_management.api";
import { useLoadingStore } from "@/store";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateGaAccountParam;
  isEdit: boolean;
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

const rules = reactive({
  ga_name: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GA_ACCOUNT_MANAGEMENT_AGENT_NAME") }),
      trigger: "blur",
    },
    {
      pattern: /^[A-Z]{2}\d{2}$/,
      message: t("MSG_INVALID_FORMAT", { format: t("MSG_GA_NAME_FORMAT") }),
      trigger: "blur",
    },
  ],
  ga_company_name: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GA_ACCOUNT_MANAGEMENT_COMPANY_NAME") }),
      trigger: "blur",
    },
  ],
  gold_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GA_ACCOUNT_MANAGEMENT_GOLD_SPLIT") }),
      trigger: "blur",
    },
  ],
  shop_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GA_ACCOUNT_MANAGEMENT_SHOP_SPLIT") }),
      trigger: "blur",
    },
  ],
  ev_split: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GA_ACCOUNT_MANAGEMENT_EV_SPLIT") }),
      trigger: "blur",
    },
  ],
  freeze_fl: [
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

    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_UPDATE" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? GaAccountManagementAPI.update : GaAccountManagementAPI.create;

      const dataToSubmit = { ...props.formData };
      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      }

      const { result, msg, errors } = await api(dataToSubmit);

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

      emit("handleCloseDialog", true);
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
</script>
