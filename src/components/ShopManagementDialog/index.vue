<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <div class="flex">
        <div class="flex-1">
          <el-form-item
            v-if="isEdit"
            prop="item_code"
            :label="`${$t('SHOP_MANAGEMENT_ITEM_CODE')}`"
          >
            <el-input v-model="formData.item_code" readonly />
          </el-form-item>
          <el-form-item prop="item_type_id" :label="`${$t('SHOP_MANAGEMENT_ITEM_TYPE')}`">
            <el-select v-model="formData.item_type_id" :clearable="false" :disabled="isEdit">
              <el-option
                v-for="shop in shopOptions"
                :key="shop.id"
                :label="shop.name"
                :value="shop.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="item_name" :label="`${$t('SHOP_MANAGEMENT_ITEM_NAME')}`">
            <el-input v-model="formData.item_name" @blur="clearError('item_name')" />
          </el-form-item>
          <el-form-item prop="icon_id" :label="`${$t('SHOP_MANAGEMENT_SELECT_IMG')}`">
            <el-select v-model="formData.icon_id" :clearable="false">
              <el-option
                v-for="icon in shopIconOptions"
                :key="icon.id"
                :label="icon.icon_name"
                :value="icon.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="flex-1 justify-center items-center flex px-4 pb-5">
          <div class="w-full h-full border-2 px-2 flex justify-center items-center">
            <img class="max-h-[calc(4*1.5rem)] w-auto object-contain" :src="iconImg" />
          </div>
        </div>
      </div>
      <el-form-item prop="item_desc" :label="`${$t('SHOP_MANAGEMENT_ITEM_DESC')}`">
        <el-input
          v-model="formData.item_desc"
          type="textarea"
          :rows="4"
          @blur="clearError('item_desc')"
        />
      </el-form-item>
      <el-form-item prop="gold_type" :label="`${$t('SHOP_MANAGEMENT_GOLD_TYPE')}`">
        <el-select v-model="formData.gold_type" :clearable="false">
          <el-option
            v-for="gold in goldOptions"
            :key="gold.id"
            :label="gold.name"
            :value="gold.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="gold" :label="`${$t('SHOP_MANAGEMENT_GOLD')}`">
        <el-input v-model.number="formData.gold" type="number" @blur="clearError('gold')" />
      </el-form-item>
      <el-form-item prop="buy_gold" :label="`${$t('SHOP_MANAGEMENT_BUY_GOLD')}`">
        <el-input v-model.number="formData.buy_gold" type="number" @blur="clearError('buy_gold')" />
      </el-form-item>
      <div class="flex">
        <el-form-item
          prop="status"
          :label="`${$t('SHOP_MANAGEMENT_STATUS')} :`"
          class="flex-1 items-center"
        >
          <el-switch
            v-model="formData.status"
            size="large"
            width="60"
            inline-prompt
            :active-text="$t('PUBLISH_LIST')"
            :inactive-text="$t('PUBLISH_UN_LIST')"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        <el-form-item
          prop="discount_fl"
          :label="`${$t('SHOP_MANAGEMENT_IS_DISCOUNT')} :`"
          class="flex-1 items-center"
        >
          <el-switch
            v-model="formData.discount_fl"
            size="large"
            width="60"
            inline-prompt
            :active-text="$t('SWITCH_OPEN')"
            :inactive-text="$t('SWITCH_CLOSE')"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
      </div>
      <el-form-item
        v-if="formData.discount_fl"
        prop="discount_gold"
        :label="`${$t('SHOP_MANAGEMENT_DISCOUNT_GOLD')}`"
      >
        <el-input
          v-model.number="formData.discount_gold"
          type="number"
          @blur="clearError('discount_gold')"
        />
      </el-form-item>
      <el-form-item
        v-if="formData.discount_fl"
        prop="give_gold"
        :label="`${$t('SHOP_MANAGEMENT_GIVE_GOLD')}`"
      >
        <el-input
          v-model.number="formData.give_gold"
          type="number"
          @blur="clearError('give_gold')"
        />
      </el-form-item>
      <el-form-item prop="start_time" :label="`${$t('SHOP_MANAGEMENT_START_TIME')}`">
        <el-date-picker
          v-model="formData.start_time"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false"
          class="flex-1"
          :readonly="formData.always_discount"
          @change="clearError('start_time')"
        />
      </el-form-item>
      <el-form-item prop="end_time" :label="`${$t('SHOP_MANAGEMENT_END_TIME')}`">
        <el-date-picker
          v-model="formData.end_time"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :clearable="false"
          class="flex-1"
          :readonly="formData.always_discount"
          @change="clearError('start_time')"
        />
      </el-form-item>
      <el-form-item
        prop="always_discount"
        :label="`${$t('SHOP_MANAGEMENT_ALWAYS_LIST')} :`"
        class="flex-1 items-center"
      >
        <el-switch
          v-model="formData.always_discount"
          size="large"
          width="60"
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
import dayjs from "dayjs";
import { EnumVO } from "@/api/enum.api";
import ShopManagementAPI, { UpdateShopManagementParam } from "@/api/shop_management.api";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";
import { useLoadingStore } from "@/store";
import { ShopIconOption } from "@/api/shop_icon_list.api";
import { appConfig } from "@/utils/config";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateShopManagementParam;
  isEdit: boolean;
  shopOptions: EnumVO[];
  goldOptions: EnumVO[];
  shopIconOptions: ShopIconOption[];
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

const iconImg = computed(
  () => props.shopIconOptions.find((e) => e.id === props.formData.icon_id)?.icon_url ?? ""
);

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

watch(
  () => props.formData.always_discount,
  (newVal) => {
    if (newVal) {
      props.formData.start_time = dayjs().startOf("day").format("YYYY-MM-DD HH:mm:ss");
      props.formData.end_time = dayjs(appConfig.value.MAX_DATE_TIME).format("YYYY-MM-DD HH:mm:ss");
    }
  }
);

const rules = reactive<{ [key: string]: any[] }>({
  item_type_id: [
    {
      required: true,
    },
  ],
  icon_id: [
    {
      required: true,
    },
  ],
  gold_type: [
    {
      required: true,
    },
  ],
  item_name: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_ITEM_NAME") }),
    },
  ],
  item_desc: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_ITEM_DESC") }),
    },
  ],
  gold: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_GOLD") }),
    },
  ],
  buy_gold: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_GOLD_TYPE") }),
    },
  ],
  start_time: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_START_TIME") }),
    },
  ],
  end_time: [
    {
      required: true,
      message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_END_TIME") }),
    },
  ],
});

watch(
  () => props.formData.discount_fl,
  (newVal) => {
    if (newVal) {
      rules.discount_gold = [
        {
          required: true,
          message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_DISCOUNT_GOLD") }),
        },
      ];

      rules.give_gold = [
        {
          required: true,
          message: t("MSG_REQUIRED", { field: t("SHOP_MANAGEMENT_GIVE_GOLD") }),
        },
      ];
    } else {
      rules.discount_gold = [];
      rules.give_gold = [];
      props.formData.discount_gold = null;
      props.formData.give_gold = null;
    }

    nextTick(() => {
      setTimeout(() => {
        if (formRef.value) {
          formRef.value.clearValidate();
        }
      }, 0);
    });
  },
  { immediate: true }
);

async function handleSubmit() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_EDIT" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? ShopManagementAPI.update : ShopManagementAPI.create;

      const dataToSubmit = { ...props.formData };
      delete (dataToSubmit as any).always_discount;
      delete (dataToSubmit as any).item_code;
      delete (dataToSubmit as any).icon_url;
      if (!isUpdate) {
        delete (dataToSubmit as any).id;
      } else {
        delete (dataToSubmit as any).item_type_id;
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
