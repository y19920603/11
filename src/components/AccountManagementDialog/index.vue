<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item prop="role_id" :label="$t('ACCOUNT_MANAGEMENT_ROLE_ID')">
        <div class="w-full flex space-x-2">
          <el-select v-model="formData.role_id" :clearable="false" :disabled="isEdit">
            <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item
        v-if="formData.role_id === 3 || formData.role_id === 4"
        prop="ga_id"
        :label="$t('ACCOUNT_MANAGEMENT_GA_ID')"
      >
        <div class="w-full flex space-x-2">
          <el-select v-model="gaId" :clearable="false" :disabled="isEdit">
            <el-option
              v-for="item in gaOptions"
              :key="item.id"
              :label="`${item.ga_name} (${item.ga_company_name})`"
              :value="item.id"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item
        v-if="formData.role_id === 4"
        prop="agent_id"
        :label="$t('ACCOUNT_MANAGEMENT_AGENT_ID')"
      >
        <div class="w-full flex space-x-2">
          <el-select
            v-model="agentId"
            :clearable="false"
            :disabled="isEdit"
            :placeholder="$t('ACCOUNT_MANAGEMENT_AGENT_ID')"
          >
            <el-option
              v-for="item in agentOptions"
              :key="item.id"
              :label="`${item.ga_name} (${item.ga_company_name})`"
              :value="item.id"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item prop="user_name" :label="$t('ACCOUNT_MANAGEMENT_USER_NAME')">
        <el-input
          v-model="formData.user_name"
          :disabled="isEdit"
          :placeholder="$t('PLACEHOLDER_PLEASE_ENTER', { key: $t('ACCOUNT_MANAGEMENT_USER_NAME') })"
          @blur="clearError('user_name')"
        />
      </el-form-item>
      <el-form-item prop="password">
        <template #label>
          {{ $t("ACCOUNT_MANAGEMENT_PASSWORD") }}
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
              $t('PLACEHOLDER_PLEASE_ENTER', { key: $t('ACCOUNT_MANAGEMENT_PASSWORD') })
            "
            @blur="clearError('password')"
          />
          <el-button type="primary" @click="generatePassword">
            <el-icon size="16"><Key /></el-icon>
          </el-button>
        </div>
      </el-form-item>
      <el-form-item prop="email" :label="$t('ACCOUNT_MANAGEMENT_EMAIL')">
        <el-input
          v-model="formData.email"
          :placeholder="$t('PLACEHOLDER_PLEASE_ENTER', { key: $t('ACCOUNT_MANAGEMENT_EMAIL') })"
          :disabled="isEdit"
          @blur="clearError('email')"
        />
      </el-form-item>
      <el-form-item prop="local_phone_number" :label="$t('ACCOUNT_MANAGEMENT_PHONE')">
        <div class="flex space-x-2 w-full">
          <Vue3CountryIntl
            v-model="formData.country_code"
            :showSelectedText="false"
          ></Vue3CountryIntl>
          <el-input
            v-model="formData.local_phone_number"
            class="flex-1 w-full"
            :placeholder="$t('PLACEHOLDER_PLEASE_ENTER', { key: $t('ACCOUNT_MANAGEMENT_PHONE') })"
            @blur="clearError('local_phone_number')"
          />
        </div>
      </el-form-item>
      <el-form-item prop="country" :label="$t('ACCOUNT_MANAGEMENT_COUNTRY')">
        <el-select v-model="formData.country" :clearable="false" filterable>
          <el-option
            v-for="item in country"
            :key="item.value"
            :label="`[${item.value}] ${item.name}`"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="lang" :label="$t('ACCOUNT_MANAGEMENT_LANG')">
        <el-select v-model="formData.lang" :clearable="false">
          <el-option v-for="item in langs" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="permission_group_id"
        :label="$t('ACCOUNT_MANAGEMENT_PERMISSION_GROUP_ID')"
      >
        <el-select v-model="permissionId" :clearable="false">
          <el-option
            v-for="item in permission_options"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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
import AccountManagementAPI, { UpdateAccountParam } from "@/api/account_management.api";
import AuthAPI from "@/api/auth.api";
import { EnumVO } from "@/api/enum.api";
import { AgentOption, GaOption } from "@/api/ga_account_management.api";
import { PermissionGroupOptionVO } from "@/api/permission_setting.api";
import { useLoadingStore } from "@/store";
import { clearAllCustomValidators, clearFieldError, updateValidationRules } from "@/utils/field";
import { FormInstance } from "element-plus";
import Vue3CountryIntl from "vue3-country-intl";
import GeneratePasswordUtility from "@/utils/password";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateAccountParam;
  isEdit: boolean;
  country: {
    value: string;
    name: string;
  }[];
  roles: EnumVO[];
  langs: EnumVO[];
  gaOptions: GaOption[];
  agentOptions: AgentOption[];
  permissionOptions: PermissionGroupOptionVO[];
}>();

const emit = defineEmits(["resetForm", "handleCloseDialog"]);

const { setLoading } = useLoadingStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const isSubmit = ref(false);

const permission_options = computed(() => {
  return props.permissionOptions.filter((e) => e.role_id === props.formData.role_id);
});

const generatePassword = () => {
  props.formData.password = GeneratePasswordUtility();
};

watchEffect(() => {
  const options = permission_options.value;
  if (options.length > 0) {
    props.formData.permission_group_id =
      props.formData.permission_group_id &&
      options.find((e) => e.id === props.formData.permission_group_id)
        ? props.formData.permission_group_id
        : options[0].id;
  } else {
    props.formData.permission_group_id = null;
  }
});

const permissionId = computed({
  get: () => props.formData.permission_group_id ?? "",
  set: (val) => {
    props.formData.permission_group_id = val;
  },
});

const gaId = computed({
  get: () => props.formData.ga_id ?? "",
  set: (val) => {
    props.formData.ga_id = val;
  },
});

const agentId = computed({
  get: () => props.formData.agent_id ?? "",
  set: (val) => {
    props.formData.agent_id = val;
  },
});

const handleClose = () => {
  emit("handleCloseDialog");
};

const clearError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(formRef.value, rules, field);
  }
};

const rules = reactive<{ [key: string]: any[] }>({
  role_id: [
    {
      required: true,
    },
  ],
  user_name: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("ACCOUNT_MANAGEMENT_USER_NAME") }),
      trigger: "blur",
    },
  ],
  email: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("ACCOUNT_MANAGEMENT_EMAIL") }),
    },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      trigger: "blur",
      message: t("MSG_FORMAT_ERROR", { field: t("ACCOUNT_MANAGEMENT_EMAIL") }),
    },
  ],
  local_phone_number: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("ACCOUNT_MANAGEMENT_PHONE") }),
    },
  ],
  country: [
    {
      required: true,
    },
  ],
  ga_id: [
    {
      required: true,
    },
  ],
  agent_id: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("ACCOUNT_MANAGEMENT_AGENT_ID") }),
    },
  ],
  lang: [
    {
      required: true,
    },
  ],
  permission_group_id: [
    {
      required: true,
    },
  ],
  password: [
    {
      required: true,
      trigger: "blur",
      message: t("MSG_REQUIRED", { field: t("ACCOUNT_MANAGEMENT_PASSWORD") }),
    },
  ],
});

// watch(
//   () => props.isEdit,
//   (newValue) => {
//     if (newValue) {
//       rules.password = [];
//     } else {
//       rules.password = [
//         {
//           required: true,
//           trigger: "blur",
//           message: t("MSG_REQUIRED", { field: t("ACCOUNT_MANAGEMENT_PASSWORD") }),
//         },
//       ];
//     }
//   },
//   {
//     immediate: true,
//   }
// );

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

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);
    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_UPDATE" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? AccountManagementAPI.update : AccountManagementAPI.create;

      const dataToSubmit = { ...props.formData };
      if (dataToSubmit.role_id !== 4) {
        dataToSubmit.agent_id = null;
      }

      if (dataToSubmit.role_id !== 4 && dataToSubmit.role_id !== 3) {
        dataToSubmit.ga_id = null;
      }

      const encrypt = await AuthAPI.getKey();

      if (dataToSubmit.password) {
        dataToSubmit.password = encrypt.encrypt(dataToSubmit.password) as string;
      }

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
          (result ? ` ` : ` message: ${msg}`);

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
