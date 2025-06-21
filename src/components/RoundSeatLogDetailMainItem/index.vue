<template>
  <div
    class="flex flex-col justify-center items-center px-2 py-8 border-t-1 border-[#343747] border-solid after:content-[''] after:w-[2px] after:h-[60%] after:block after:absolute relative after:bg-#343747 after:right-0"
    :class="span === 1 ? `xl:col-span-1` : `xl:col-span-2`"
  >
    <span>{{ title }}</span>
    <span>{{ value }}</span>
  </div>
</template>
<script setup lang="ts">
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  span: {
    type: Number,
    default: () => 1,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>
