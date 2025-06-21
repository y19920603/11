<template>
  <div class="w-full">
    <button
      v-show="!previewUrl"
      class="border-2 border-white text-center p-0 bg-[#2c2e3b] cursor-pointer p-8"
      @click.prevent="triggerFileSelect"
    >
      <slot></slot>
    </button>

    <input
      ref="fileInput"
      type="file"
      class="mt-3"
      style="display: none"
      accept="image/*"
      required
      @change="handleFileChange"
    />

    <div v-if="previewUrl" class="w-full h-[150px]! relative">
      <img
        :src="previewUrl"
        class="max-h-full max-w-full w-full h-full absolute top-0 bottom-0 left-0 right-0 m-auto object-cover"
        alt="Preview"
        @click.prevent="triggerFileSelect"
      />
      <el-icon
        class="absolute top-0 right-0 text-white rounded-full cursor-pointer"
        @click="resetFile"
      >
        <CloseBold />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { appConfig } from "@/utils/config";
import { errorAlert } from "@/utils/message";
const { t } = useI18n();
const emit = defineEmits(["change"]);
const maxSize = computed(() => appConfig.value.MAX_IMAGE_SIZE_MB * 1024 * 1024);

const props = defineProps({
  imagePic: {
    type: String,
    default: "",
  },
});

const fileInput = ref(null);
const previewData = ref("");
const previewUrl = computed(() => {
  if (previewData.value) {
    return previewData.value;
  }

  if (props.imagePic) {
    return props.imagePic;
  }

  return "";
});

const triggerFileSelect = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (file.size > maxSize.value) {
    errorAlert(t, t("MSG_PICTURE_LIMIT", { size: appConfig.value.MAX_IMAGE_SIZE_MB }));
    resetFile();
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewData.value = e.target.result;
  };
  reader.readAsDataURL(file);
  emit("change", file);
};

const resetFile = () => {
  previewData.value = "";
  fileInput.value.value = "";
};

defineExpose({
  resetFile,
});
</script>
