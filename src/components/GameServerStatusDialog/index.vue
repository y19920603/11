<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item v-if="!isCancel" prop="shutdown_time">
        <template #label>
          {{ $t("GAME_SERVER_STATUS_SHOUT_DOWN_TIME") }}
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="$t('MSG_GAME_SERVER_STATUS_SHOUT_DOWN_TIME')"
            placement="right"
          >
            <el-icon class="text-red relative top-[3px] cursor-pointer">
              <WarningFilled />
            </el-icon>
          </el-tooltip>
        </template>

        <el-date-picker
          v-model="formData.shutdown_time"
          type="datetime"
          class="w-full!"
          :clearable="false"
          value-format="YYYY-MM-DDTHH:mm:ss"
          @blur="clearError('shutdown_time')"
        />
      </el-form-item>
      <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
        <el-input
          v-model="formData.password"
          show-password
          type="password"
          @blur="clearError('password')"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer flex justify-center space-x-10">
        <el-button class="px-10" type="danger" @click="handleSubmit">
          {{ $t("BUTTON_SEND") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { useLoadingStore } from "@/store";
import { FormInstance } from "element-plus";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { clearAllCustomValidators, clearFieldError, updateValidationRules } from "@/utils/field";
import AuthAPI from "@/api/auth.api";
import GameServerStatusAPI from "@/api/game_server_status.api";
import { actionResultAlert } from "@/utils/message";
dayjs.extend(utc);

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: {
    shutdown_time: string;
    password: string;
  };
  isCancel: boolean;
}>();

const emit = defineEmits(["resetForm", "handleCloseDialog"]);

const { setLoading } = useLoadingStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const isSubmit = ref(false);

const handleClose = () => {
  resetForm();
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

  props.formData.shutdown_time = dayjs().add(1, "day").startOf("day").format("YYYY-MM-DDTHH:mm:ss");
  props.formData.password = "";
};

const rules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
  shutdown_time: [{ required: true }],
});

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    const encrypt = await AuthAPI.getKey();

    if (props.isCancel) {
      setLoading(true);
      try {
        const { result, errors, msg } = await GameServerStatusAPI.cancelShutdown({
          password: encrypt.encrypt(props.formData.password) as string,
        });
        if (!result) {
          if (errors && typeof errors === "object") {
            isSubmit.value = true;
            updateValidationRules(formRef.value, rules, errors);
          }

          if (!errors && msg) {
            actionResultAlert(t, result, msg, "BUTTON_SYNC");
          }
        } else {
          await ElMessageBox.alert(
            t("MSG_ACTION_SUCCESS_MESSAGE", {
              action: t("BUTTON_SERVER_CANCEL_SHOUT_DOWN"),
            }),
            {
              confirmButtonText: t("BUTTON_CONFIRM"),
            }
          );
        }

        if (!result) {
          return;
        }
        handleClose();
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
    } else {
      ElMessageBox.confirm(
        `<div class='flex flex-col items-start'>
        <span>${t("MSG_SHOUT_DOWN_CONFIRM_0", { time: dayjs(props.formData.shutdown_time).format("YYYY-MM-DD HH:mm:ss") })}</span>
    </div>`,
        "",
        {
          confirmButtonText: t("BUTTON_CONFIRM"),
          cancelButtonText: t("BUTTON_CANCEL"),
          dangerouslyUseHTMLString: true,
        }
      )
        .then(async () => {
          setLoading(true);
          try {
            const { result, errors } = await GameServerStatusAPI.shutdown({
              ...props.formData,
              password: encrypt.encrypt(props.formData.password) as string,
            });
            if (!result) {
              if (errors && typeof errors === "object") {
                isSubmit.value = true;
                updateValidationRules(formRef.value, rules, errors);
              }
            } else {
              await ElMessageBox.alert(
                t("MSG_SHOUT_DOWN_SUCCESS", {
                  time: dayjs(props.formData.shutdown_time).format("YYYY-MM-DD HH:mm:ss"),
                }),
                {
                  confirmButtonText: t("BUTTON_CONFIRM"),
                }
              );
            }

            if (!result) {
              return;
            }
            handleClose();
          } catch (error) {
            console.error("Submit error:", error);
          } finally {
            setLoading(false);
          }
        })
        .catch(() => {});
    }
  });
}
</script>
