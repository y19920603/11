<template>
  <el-dialog
    v-model="localShowModel"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    :title="`${$t('BUTTON_CHANGE')}${$t('ACCOUNT_MANAGEMENT_PASSWORD')}`"
    :close-on-click-modal="allowClear"
    :close-on-press-escape="allowClear"
    :show-close="allowClear"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
      <el-form-item v-if="allowClear" prop="old_password">
        <template #label>
          {{ $t("CHANGE_PASSWORD_OLD_PASSWORD") }}
        </template>

        <div class="flex w-full space-x-1">
          <el-input
            v-model="formData.old_password"
            type="password"
            name="password"
            show-password
            :placeholder="
              $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('CHANGE_PASSWORD_OLD_PASSWORD') })
            "
            @blur="clearError('old_password')"
          />
        </div>
      </el-form-item>
      <el-form-item prop="password">
        <template #label>
          {{ $t("CHANGE_PASSWORD_NEW_PASSWORD") }}
          <el-tooltip class="box-item" effect="dark" placement="right">
            <template #content>
              <div style="white-space: pre-line">
                {{ $t("MSG_PASSWORD_HINT") }}
              </div>
            </template>

            <el-icon class="text-red cursor-pointer relative top-[2px]">
              <WarningFilled />
            </el-icon>
          </el-tooltip>
        </template>

        <div class="flex w-full space-x-1">
          <el-input
            v-model="formData.password"
            type="password"
            name="password"
            show-password
            :placeholder="
              $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('CHANGE_PASSWORD_NEW_PASSWORD') })
            "
            @blur="clearError('password')"
          />
          <el-button type="primary" @click="generatePassword">
            <el-icon size="16"><Key /></el-icon>
          </el-button>
        </div>
      </el-form-item>
      <el-form-item prop="confirm" :label="$t('CHANGE_PASSWORD_CONFIRM')">
        <div class="flex w-full space-x-1">
          <el-input
            v-model="formData.confirm"
            type="password"
            name="password"
            show-password
            :placeholder="$t('PLACEHOLDER_PLEASE_ENTER', { key: $t('CHANGE_PASSWORD_CONFIRM') })"
            @blur="clearError('confirm')"
          />
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer flex justify-center space-x-10">
        <el-button class="px-10" type="danger" @click="handleSubmit">
          {{ $t("BUTTON_CHANGE") }}
        </el-button>
        <el-button class="px-10" type="primary" @click="resetForm">
          {{ $t("BUTTON_RESET") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { useLoadingStore, useUserStore } from "@/store";
import { FormInstance } from "element-plus";
import GeneratePasswordUtility from "@/utils/password";
import AuthAPI from "@/api/auth.api";
import AccountManagementAPI from "@/api/account_management.api";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";

const emit = defineEmits(["update:showModel", "handleCloseDialog"]);
const props = defineProps({
  showModel: {
    type: Boolean,
    default: () => false,
  },
  allowClear: {
    type: Boolean,
    default: () => false,
  },
});

const localShowModel = computed({
  get: () => props.showModel,
  set: (val: boolean) => emit("update:showModel", val),
});

const formData = ref<{ password: string; confirm: string; old_password: string }>({
  password: "",
  confirm: "",
  old_password: "",
});
const formRef = ref<FormInstance>();
const { setLoading } = useLoadingStore();
const userStore = useUserStore();
const isSubmit = ref(false);
const { t } = useI18n();
const rules = reactive<{ [key: string]: any[] }>({
  old_password: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("CHANGE_PASSWORD_OLD_PASSWORD") }),
    },
  ],
  password: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("CHANGE_PASSWORD_NEW_PASSWORD") }),
    },
  ],
  confirm: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("CHANGE_PASSWORD_CONFIRM") }),
    },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== formData.value.password) {
          callback(new Error(t("MSG_CONFIRM_PASSWORD_NOT_MATCH")));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});
const generatePassword = () => {
  const newPwd = GeneratePasswordUtility();
  formData.value.password = newPwd;
  formData.value.confirm = newPwd;
};

const handleClose = () => {
  resetForm();
};

const resetForm = () => {
  clearAllCustomValidators(rules);
  formData.value.old_password = "";
  formData.value.password = "";
  formData.value.confirm = "";
  isSubmit.value = false;
  nextTick(() => {
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    }, 0);
  });
};

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

    try {
      const action = t("BUTTON_CHANGE");

      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...formData.value };

      delete (dataToSubmit as any).confirm;

      if (props.allowClear) {
        if (dataToSubmit.old_password) {
          dataToSubmit.old_password = encrypt.encrypt(dataToSubmit.old_password) as string;
        }
      } else {
        delete (dataToSubmit as any).old_password;
      }

      if (dataToSubmit.password) {
        dataToSubmit.password = encrypt.encrypt(dataToSubmit.password) as string;
      }

      const { result, msg, errors } = await AccountManagementAPI.resetPassword(dataToSubmit);

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

      if (props.allowClear) {
        emit("handleCloseDialog");
      } else {
        await userStore.getUserInfo();
      }
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
