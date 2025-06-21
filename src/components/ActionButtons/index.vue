<template>
  <div class="flex justify-center items-center space-x-4 operator">
    <el-icon :size="20" class="cursor-pointer" @click="handleEdit">
      <EditPen />
    </el-icon>

    <el-popconfirm
      class="box-item"
      :title="confirmText"
      placement="top"
      :hide-icon="true"
      :confirm-button-text="$t('BUTTON_CONFIRM')"
      :cancel-button-text="$t('BUTTON_CANCEL')"
      @confirm="confirmEvent"
    >
      <template #reference>
        <el-icon v-if="is_delete" :size="20" class="cursor-pointer text-red-500">
          <Delete />
        </el-icon>
      </template>
    </el-popconfirm>
  </div>
</template>

<script setup lang="ts">
import { EditPen, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    row: Record<string, any>;
    field?: string;
    is_delete?: boolean;
  }>(),
  {
    field: "",
    is_delete: true,
  }
);

const emit = defineEmits(["edit", "delete"]);

const confirmText = computed(() => {
  const textAry = props.field.split(",");
  if (textAry.length === 1) {
    return t("MSG_DELETE_CONFIRM", { field: props.row[textAry[0]] });
  } else {
    return t("MSG_DELETE_CONFIRM", { field: `${props.row[textAry[0]]}(${props.row[textAry[1]]})` });
  }
});

const handleEdit = () => {
  emit("edit", props.row);
};

const confirmEvent = () => {
  emit("delete", props.row);
};
</script>
<style lang="scss">
.el-popconfirm__main {
  word-break: break-all;
}
</style>
