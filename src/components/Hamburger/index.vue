<template>
  <div class="flex items-center justify-center px-4 cursor-pointer" @click="toggleClick">
    <i class="block w-[30px] h-[30px] bg-[url('@/assets/icons/Bars.png')]"></i>
    <img :src="`src/assets/images/cms-logo.png`" class="h-[42px] w-[168px] mx-6" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  isActive: { type: Boolean, required: true },
});

const emit = defineEmits(["toggleClick"]);

function toggleClick() {
  emit("toggleClick");
}
</script>
