<template>
  <div class="space-y-2 2xl:my-2">
    <div class="space-x-2 flex items-start">
      <slot name="goImgUpload" />
      <button
        v-can="permissionName"
        class="h-[40px] text-sm flex justify-center items-center px-6 py-3 rounded-full bg-[#34c38f] flex justify-center items-center flex-1 2xl:flex-initial cursor-pointer whitespace-nowrap text-white w-max"
        @click="addNewItem"
      >
        <el-icon size="14" class="mr-1 font-bold"><Plus /></el-icon>
        {{ btnName }}
      </button>

      <slot />
    </div>
  </div>
</template>
<script setup lang="ts">
const emits = defineEmits(["add"]);

defineProps({
  btnName: {
    type: String,
    default: () => "",
  },
  permissionName: {
    type: String,
    default: () => "",
  },
});

const addNewItem = () => {
  emits("add");
};
</script>
