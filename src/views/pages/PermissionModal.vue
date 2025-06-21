<template>
  <el-dialog
    :model-value="visible"
    :title="
      props.editId
        ? $t('PERMISSION_SETTINGS_EDIT_SETTINGS')
        : $t('PERMISSION_SETTINGS_ADD_SETTINGS')
    "
    class="custom-modal !w-[100%] !sm:w-[60%] !xl:w-[30%] p-5!"
    width="auto"
    @close="onClose"
  >
    <!-- 權限群組基本資訊 -->
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item
        :label="$t('PERMISSION_SETTINGS_SETTINGS_GROUP_NAME')"
        prop="name"
        label-position="top"
      >
        <el-input v-model="form.name" class="bg-[var(--bs-body-color)] border-none text-white" />
      </el-form-item>

      <el-form-item :label="$t('PERMISSION_SETTINGS_GROUP_CATEGORY')" prop="role">
        <el-radio-group v-model="form.role" :disabled="!!props.editId">
          <el-radio-button label="SuperAdmin" role-id="1">
            {{ $t("PERMISSION_SETTINGS_SUPER_ADMIN") }}
          </el-radio-button>
          <el-radio-button label="Admin" role-id="2">
            {{ $t("PERMISSION_SETTINGS_ADMIN") }}
          </el-radio-button>
          <el-radio-button label="GeneralAgent" role-id="3">
            {{ $t("PERMISSION_SETTINGS_GA") }}
          </el-radio-button>
          <el-radio-button label="Agent" role-id="4">
            {{ $t("PERMISSION_SETTINGS_AGENT") }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="$t('PERMISSION_SETTINGS_PERMISSION')">
        <el-switch
          v-model="form.enableAll"
          inline-prompt
          :active-text="$t('PERMISSION_SETTINGS_ALL_OPEN')"
          :inactive-text="$t('PERMISSION_SETTINGS_ALL_CLOSE')"
        />
      </el-form-item>
    </el-form>

    <!-- 權限結構 Tab -->
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="tab in tabList" :key="tab.id" :label="tab.name" :name="tab.id">
        <div v-for="item in filteredModules(tab.id)" :key="item.id" class="mb-4">
          <!-- 父權限 -->
          <div class="flex justify-between items-center font-bold mb-2">
            <span>{{ item.name }}</span>
            <el-switch
              :model-value="isParentChecked(item)"
              inline-prompt
              :active-text="$t('PERMISSION_SETTINGS_ALL_OPEN')"
              :inactive-text="$t('PERMISSION_SETTINGS_ALL_CLOSE')"
              @change="onParentToggle(item)"
            />
          </div>

          <!-- 子權限 -->
          <div v-if="item.children.length" class="pl-4 border-l border-gray-700 space-y-2">
            <div
              v-for="child in item.children"
              :key="child.id"
              class="flex justify-between items-center text-sm text-gray-300"
            >
              <span>- {{ child.name }}</span>
              <el-switch
                v-model="form.permissions[child.id]"
                inline-prompt
                :active-text="$t('PERMISSION_SETTINGS_OPEN')"
                :inactive-text="$t('PERMISSION_SETTINGS_CLOSE')"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end gap-2 mt-4">
        <el-button class="bg-gray-500 text-white" @click="handleReset">
          {{ $t("PERMISSION_SETTINGS_RESET") }}
        </el-button>
        <el-button type="danger" :loading="submitLoading" @click="handleSubmit">
          {{ $t("PERMISSION_SETTINGS_CONFIRM") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { ElMessageBox } from "element-plus";
import PermissionAPI from "@/api/permission_setting.api";
import type { PermissionSubItem } from "@/api/permission_setting.api";

const { t } = useI18n();

// Props / Emits
const props = defineProps<{
  visible: boolean;
  editId?: number | null;
}>();
const emit = defineEmits(["update:visible", "submitted"]);
// 表單驗證相關
const formRef = ref();
const submitLoading = ref(false);
const rules = {
  name: [{ required: true, message: t("PERMISSION_SETTINGS_ERROR_TEXT"), trigger: "blur" }],
};

// 權限表單資料 & 初始備份
const defaultForm = {
  id: null as number | null,
  name: "",
  role: "SuperAdmin",
  enableAll: false,
  permissions: {} as Record<number, boolean>,
};
const form = ref<typeof defaultForm>(structuredClone(defaultForm));

// 分頁標籤固定對應 tab_id
const tabList = ref([
  { id: 1, name: t("PERMISSION_SETTINGS_Account") },
  { id: 2, name: t("PERMISSION_SETTINGS_SYSTEM_SETTINGS") }, // 系統權限
  { id: 3, name: t("PERMISSION_SETTINGS_GAME_SETTINGS") }, // 遊戲權限
  { id: 4, name: t("PERMISSION_SETTINGS_LIST_SETTINGS") }, // 記錄列表
]);
const activeTab = ref(1);
const allModules = ref<any[]>([]);

// 對應角色名稱轉換
const roleMap: Record<string, number> = {
  SuperAdmin: 1,
  Admin: 2,
  GeneralAgent: 3,
  Agent: 4,
};

// 初始化權限資料
onMounted(async () => {
  try {
    const { result, data } = await PermissionAPI.getPermissionStructure();
    if (result && Array.isArray(data)) {
      allModules.value = data;
      data.forEach((mod) => {
        if (Array.isArray(mod.sub_item)) {
          mod.sub_item.forEach((sub) => {
            form.value.permissions[sub.id] = false;
            defaultForm.permissions[sub.id] = false;
          });
        }
      });
    }
  } catch (err) {
    ElMessageBox.alert(t("PERMISSION_SETTINGS_ERROR_GROUP_TEXT"), t("PERMISSION_SETTINGS_FAIL"), {
      type: "error",
      confirmButtonText: "OK",
    });
  }
});

// 關閉 modal 時清除表單
watch(
  () => props.visible,
  async (v) => {
    if (v && props.editId) {
      await loadGroupDetail(props.editId);
    } else if (!v) {
      handleReset();
      activeTab.value = 1;
      submitLoading.value = false;
    }
  }
);

function onClose() {
  // 關閉 dialog
  emit("update:visible", false);

  // 清除 loading 狀態
  submitLoading.value = false;

  // 清空表單
  Object.assign(form.value, JSON.parse(JSON.stringify(defaultForm)));
  // 清空備份
  originalForm.value = null;
  // 還原 tab
  activeTab.value = 1;
}

const originalForm = ref<any>(null);

// 載入要編輯的群組資料
async function loadGroupDetail(id: number) {
  try {
    const resultObj = await PermissionAPI.getPermissionGroupDetail(id);
    console.log("API 回傳內容", resultObj);

    const { result, data } = resultObj;
    if (!result) {
      ElMessageBox.alert(t("PERMISSION_SETTINGS_ERROR_GROUP_TEXT"), t("PERMISSION_SETTINGS_FAIL"), {
        type: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    form.value = structuredClone(defaultForm);
    form.value.id = id;
    form.value.name = data.name ?? "";
    form.value.role =
      Object.keys(roleMap).find((key) => roleMap[key] === data.role_id) || "SuperAdmin";

    if (data.modules && Array.isArray(data.modules)) {
      allModules.value.forEach((mod) => {
        if (Array.isArray(mod.sub_item)) {
          mod.sub_item.forEach((sub: PermissionSubItem) => {
            if (data.modules.includes(sub.id)) {
              form.value.permissions[sub.id] = true;
            }
          });
        }
      });
    }

    // 備份這份編輯時的資料
    originalForm.value = JSON.parse(JSON.stringify(form.value));
  } catch (err) {
    ElMessageBox.alert(t("PERMISSION_SETTINGS_ERROR_GROUP_TEXT"), t("PERMISSION_SETTINGS_FAIL"), {
      type: "error",
      confirmButtonText: "OK",
    });
  }
}

// 權限模組依 tab 過濾
const filteredModules = (tabId: number) => {
  return allModules.value
    .filter((mod) => mod.parent_id === 0 && mod.tab_id === tabId)
    .map((parent) => ({
      ...parent,
      children: parent.sub_item ?? [],
    }));
};

function isParentChecked(parent: any) {
  const children = parent.sub_item || [];
  return children.length && children.every((child: any) => form.value.permissions[child.id]);
}

// 父權限切換，同步子權限
function onParentToggle(parent: any) {
  const children = parent.sub_item || [];
  const allChecked = children.every((child: any) => form.value.permissions[child.id]);

  children.forEach((child: any) => {
    form.value.permissions[child.id] = !allChecked;
  });
}

// 全開控制
watch(
  () => form.value.enableAll,
  (enabled) => {
    Object.keys(form.value.permissions).forEach((key) => {
      form.value.permissions[+key] = enabled; // +key 轉成 number
    });
  }
);

// 提交處理
async function handleSubmit() {
  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;

    submitLoading.value = true;

    try {
      const enabledIds: number[] = [];

      allModules.value.forEach((mod) => {
        // 父權限.id
        // if (form.value.permissions[mod.name]) {
        //   enabledIds.push(mod.id);
        // }

        if (Array.isArray(mod.sub_item)) {
          mod.sub_item.forEach((sub: { id: number; name: string }) => {
            if (form.value.permissions[sub.id]) {
              enabledIds.push(sub.id);
            }
          });
        }
      });

      const payload = {
        name: form.value.name,
        role_id: roleMap[form.value.role],
        module_id: enabledIds,
      };

      let result, msg, errors;

      if (form.value.id) {
        ({ result, msg, errors } = await PermissionAPI.updatePermissionGroup({
          id: form.value.id,
          ...payload,
        }));
      } else {
        ({ result, msg, errors } = await PermissionAPI.insertPermissionGroup(payload));
      }

      if (result) {
        ElMessageBox.alert(
          t("PERMISSION_SETTINGS_SUCCESS_GROUP_TEXT"), // 訊息內容
          t("PERMISSION_SETTINGS_SUCCESS"),
          {
            type: "success",
            confirmButtonText: "OK",
          }
        );
        emit("update:visible", false);
        emit("submitted"); //通知父層刷新表格
      } else {
        let errorText = msg || t("PERMISSION_SETTINGS_FAILE");
        if (Array.isArray(errors) && errors.length > 0) {
          errorText +=
            "\n\n" +
            errors
              .map((e: { field: string; message: string }) => `${e.field}：${e.message}`)
              .join("\n");
        }

        ElMessageBox.alert(errorText, "error", {
          type: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err: any) {
      ElMessageBox.alert("error", {
        type: "error",
        confirmButtonText: t("PERMISSION_SETTINGS_CLOSE"),
      });
    } finally {
      submitLoading.value = false;
    }
  });
}

// 重設按鈕
function handleReset() {
  if (props.editId && originalForm.value) {
    form.value = JSON.parse(JSON.stringify(originalForm.value));
  } else {
    form.value = JSON.parse(JSON.stringify(defaultForm));
  }
}
</script>
