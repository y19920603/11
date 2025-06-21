<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :label-position="isSmallScreen ? 'top' : 'right'"
    >
      <el-form-item prop="title" :label="`${$t('MARQUEE_TITLE')}`">
        <el-input v-model="formData.title" @blur="clearError('title')" />
      </el-form-item>
      <div class="flex">
        <el-form-item
          prop="status"
          :label="`${$t('MARQUEE_STATUS')} :`"
          class="flex-1 items-center"
        >
          <el-switch
            v-model="formData.status"
            size="large"
            width="60"
            inline-prompt
            :active-text="$t('STATUS_ENABLE')"
            :inactive-text="$t('STATUS_DISABLE')"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>

        <el-form-item prop="interval_min" class="flex-1 flex items-center">
          <template #label>
            <div class="flex justify-center items-center">
              {{ $t("MARQUEE_INTERVAL_MIN") }}
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="$t('MSG_MARQUEE_INTERVAL_MIN_LIMIT')"
                placement="right"
              >
                <el-icon class="text-red cursor-pointer">
                  <WarningFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-input v-model="formData.interval_min" @blur="clearError('interval_min')" />
        </el-form-item>
      </div>
      <el-form-item prop="start_time" :label="`${$t('BANNER_MANAGEMENT_START_TIME')} :`">
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
      <el-tabs v-model="activeName" class="marquee-demo-tabs w-full">
        <el-tab-pane v-for="lang in langs" :label="lang.name" :name="lang.id"></el-tab-pane>
      </el-tabs>
      <el-form-item prop="messages" class="message">
        <el-input
          v-model="currentMessage"
          type="textarea"
          :placeholder="`${$t('MARQUEE_MESSAGE')}`"
          :rows="6"
          @change="clearError('messages')"
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
import { EnumVO } from "@/api/enum.api";
import MarqueeAPI, { UpdateMarqueeParam } from "@/api/marquee.api";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";
import { useLoadingStore } from "@/store";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateMarqueeParam;
  isEdit: boolean;
  isSmallScreen: boolean;
  publicStartTypes: {
    value: number;
    label: string;
  }[];
  publicEndTypes: {
    value: number;
    label: string;
  }[];
  langs: EnumVO[];
}>();

const emit = defineEmits(["resetForm", "handleCloseDialog"]);

const { setLoading } = useLoadingStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const isSubmit = ref(false);
const activeName = ref(1);
const currentMessage = ref<string>("");
watch(
  activeName,
  (newLangId, oldLangId) => {
    const oldIndex = props.formData.messages.findIndex((msg) => msg.lang === oldLangId);
    if (oldIndex !== -1) {
      props.formData.messages[oldIndex].text = currentMessage.value;
    } else {
      props.formData.messages.push({ lang: oldLangId as number, text: currentMessage.value });
    }

    const newMsg = props.formData.messages.find((msg) => msg.lang === newLangId);
    currentMessage.value = newMsg ? newMsg.text : "";
  },
  {
    immediate: true,
  }
);

const handleClose = () => {
  activeName.value = 1;
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
  activeName.value = 1;
  nextTick(() => {
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    }, 0);
  });
  emit("resetForm");
};

const rules = reactive<{ [key: string]: any[] }>({
  title: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("MARQUEE_TITLE") }),
    },
  ],
  interval_min: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("MARQUEE_INTERVAL_MIN") }),
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

async function handleSubmit() {
  const currentLangId = activeName.value;
  const idx = props.formData.messages.findIndex((msg) => msg.lang === currentLangId);
  if (idx !== -1) {
    props.formData.messages[idx].text = currentMessage.value;
  } else if (currentMessage.value.trim() !== "") {
    props.formData.messages.push({ lang: currentLangId, text: currentMessage.value });
  }

  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_EDIT" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? MarqueeAPI.update : MarqueeAPI.create;

      const dataToSubmit = { ...props.formData };
      delete (dataToSubmit as any).start_type;
      delete (dataToSubmit as any).end_type;
      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      }
      dataToSubmit.messages = dataToSubmit.messages.filter((e) => e.text);

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
<style lang="scss">
.message > .el-form-item__content {
  margin-left: 0px !important;
}
</style>
