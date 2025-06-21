<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item prop="type" :label="$t('WHITE_LIST_TYPE')">
        <div class="w-full flex space-x-2">
          <el-select v-model="formData.type" :clearable="false">
            <el-option
              v-for="item in whiteTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item prop="ip" :label="$t('WHITE_LIST_IP')">
        <div class="w-full flex space-x-2">
          <el-input v-model="formData.ip" :disabled="isEdit" @blur="clearError('ip')" />
        </div>
      </el-form-item>
      <el-form-item prop="description" :label="$t('WHITE_LIST_DESCRIPTION')">
        <div class="w-full flex space-x-2">
          <el-input v-model="formData.description" @blur="clearError('description')" />
        </div>
      </el-form-item>
      <el-form-item prop="status" :label="$t('WHITE_LIST_STATUS')">
        <el-switch
          v-model="formData.status"
          width="80"
          inline-prompt
          :active-text="$t('WHITE_LIST_EFFECTIVE')"
          :inactive-text="$t('WHITE_LIST_INEFFECTIVE')"
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
import WhiteListAPI, { UpdateIpParam } from "@/api/white_list.api";
import { useLoadingStore } from "@/store";
import { clearAllCustomValidators, clearFieldError, updateValidationRules } from "@/utils/field";
import { FormInstance } from "element-plus";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateIpParam;
  isEdit: boolean;
  whiteTypes: {
    value: number;
    label: string;
  }[];
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
  ip: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("WHITE_LIST_IP") }),
      trigger: "blur",
    },
  ],
  type: [
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
      const api = isUpdate ? WhiteListAPI.update : WhiteListAPI.create;

      const dataToSubmit = { ...props.formData };

      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      }

      dataToSubmit.status = Boolean(dataToSubmit.status);

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
          type: result ? "success" : "error",
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
