<template>
  <div
    class="flex justify-between h-[var(--navbar-height)] bg-[var(--el-bg-color)] shadow-[inset_0_-2px_0_#ececec] dark:shadow-[inset_0_-2px_0_#000000]"
  >
    <div class="flex items-center">
      <Hamburger :is-active="isSidebarOpened" @toggle-click="toggleSideBar" />
    </div>
    <div class="md:hidden flex-1 justify-center flex items-center cursor-pointer">
      <img :src="cmsLogo" class="h-[42px] w-[168px]" @click="goHome" />
    </div>
    <NavbarRight />
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import cmsLogo from "@/assets/images/cms-logo.png";

const router = useRouter();
const appStore = useAppStore();

const isSidebarOpened = computed(() => appStore.sidebar.opened);

const goHome = () => {
  router.push("/dashboard");
};

function toggleSideBar() {
  appStore.toggleSidebar();
}
</script>
