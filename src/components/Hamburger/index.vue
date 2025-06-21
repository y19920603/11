<template>
  <div
    class="flex items-center justify-center px-3 cursor-pointer"
    :class="appStore.sidebar.opened ? 'md:pl-10' : 'md:pl-[10px]'"
  >
    <i
      class="block w-[36px] h-[36px] rounded-md flex justify-center items-center dark:bg-[#2f3343]"
      @click="toggleClick"
    >
      <img :src="bars" />
    </i>
    <img :src="cmsLogo" class="hidden h-[42px] w-[168px] mx-6 md:block" @click="goHome" />
  </div>
</template>

<script setup lang="ts">
import cmsLogo from "@/assets/images/cms-logo.png";
import bars from "@/assets/icons/basrs.png";
import { useAppStore } from "@/store";

defineProps({
  isActive: { type: Boolean, required: true },
});
const router = useRouter();
const appStore = useAppStore();

const emit = defineEmits(["toggleClick"]);

const goHome = () => {
  router.push("/dashboard");
};

function toggleClick() {
  emit("toggleClick");
}
</script>
