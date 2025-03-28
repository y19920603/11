<template>
  <div class="bg-[#242735] space-x-4 flex justify-center items-center mr-5">
    <LangSelect />
    <Fullscreen />

    <!-- 用户头像（个人中心、注销登录等） -->
    <el-dropdown trigger="click" @visible-change="handleDropdownVisibleChange">
      <div class="flex justify-center items-center w-[176px] h-[40px] bg-[#1A1D29] rounded-full">
        <div class="space-x-[12px] flex justify-center items-center">
          <img class="w-[32px] h-[32px] rounded-full" :src="userStore.userInfo.avatar" />
          <span class="">寫死人名</span>
        </div>
        <div class="flex-1"></div>
        <i
          :class="[
            'w-[16px] h-[16px] block bg-[url(src/assets/icons/Arrow.png)] mr-4 transition-transform duration-300 ease-in-out',
            { 'rotate-180': dropdownVisible },
          ]"
        ></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="w-[176px]">
          <el-dropdown-item @click="handleProfileClick">
            {{ $t("USER_PROFILE") }}
          </el-dropdown-item>
          <el-dropdown-item @click="handleProfileClick">
            {{ $t("USER_MARGIN") }}
          </el-dropdown-item>
          <el-dropdown-item @click="handleProfileClick">
            {{ $t("USER_CHANGE_PASSWORD") }}
          </el-dropdown-item>
          <el-dropdown-item divided @click="logout">
            {{ $t("USER_LOGOUT") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup lang="ts">
import { useUserStore, useTagsViewStore } from "@/store";

const userStore = useUserStore();
const tagsViewStore = useTagsViewStore();

const route = useRoute();
const router = useRouter();
const dropdownVisible = ref(false);

const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible;
};

function handleProfileClick() {
  router.push({ name: "Profile" });
}

function logout() {
  userStore
    .logout()
    .then(() => {
      tagsViewStore.delAllViews();
    })
    .then(() => {
      router.push(`/login?redirect=${route.fullPath}`);
    });
}
</script>
