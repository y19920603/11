<template>
  <i
    class="w-4 h-4 block bg-no-repeat"
    :class="{ 'ml-5': props.icon }"
    :style="props.icon ? { 'background-image': `url('${getMenuImg(props.icon)}')` } : {}"
  ></i>
  <span
    v-if="props.title"
    class="text-[#ADB3D4]"
    :class="{ 'ml-2 space-x-1': props.icon, '-ml-4 space-x-2': !props.icon }"
  >
    <span>{{ props.function_code }}</span>
    <span>{{ props.title }}</span>
  </span>
  <div class="flex-1"></div>
  <img v-if="!props.subItem && props.sortable !== 0" class="pl-1 pr-[2px]" :src="Star" />
</template>

<script setup lang="ts">
import getMenuImg from "@/utils/menuImg";
import Star from "@/assets/icons/Star.png";

const props = defineProps<{
  icon?: string;
  title?: string;
  subItem: boolean;
  function_code?: string;
  sortable?: number | undefined;
}>();
</script>
