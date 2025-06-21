<template>
  <div
    class="bg-[--el-bg-color] space-x-4 md:flex! justify-center items-center mr-5 hidden! shadow-[inset_0_-2px_0_#ececec] dark:shadow-[inset_0_-2px_0_#000000]"
  >
    <LangSelect v-if="user.userInfo?.user_name" />
    <!-- <MultiScreen /> -->
    <DarkMode />
    <Fullscreen />
    <!-- 用户头像（个人中心、注销登录等） -->
    <el-dropdown trigger="click" @visible-change="handleDropdownVisibleChange">
      <div
        class="flex justify-center items-center w-auto h-[40px] bg-[--bg-settings] rounded-full border border-[#ececec] dark:border-none"
      >
        <div class="space-x-[12px] flex justify-center items-center cursor-pointer">
          <img class="w-[40px] h-[40px] rounded-full" :src="avatar" />
          <span class="">{{ userName }}</span>
        </div>
        <div class="flex-1"></div>
        <i
          :class="[
            'w-[16px] h-[16px]  mr-4 transition-transform duration-300 ease-in-out',
            { 'rotate-180': dropdownVisible },
          ]"
          :style="`background-image: url(${arrowIcon})`"
        ></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="w-[176px] navbarDropdown">
          <!-- <el-dropdown-item @click="handleProfileClick">
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
          </el-dropdown-item> -->
          <el-dropdown-item @click="logout">
            {{ $t("USER_LOGOUT") }}
          </el-dropdown-item>

          <el-dropdown-item @click="changePassword">
            {{ $t("USER_CHANGE_PASSWORD") }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
  <div class="md:hidden w-[62px] flex justify-center items-center cursor-pointer">
    <el-dropdown :hide-on-click="false" trigger="click">
      <el-icon size="30" class="text-[#8980fc]"><Setting /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="logout">
            {{ $t("USER_LOGOUT") }}
          </el-dropdown-item>
          <el-dropdown-item @click="changePassword">
            {{ $t("USER_CHANGE_PASSWORD") }}
          </el-dropdown-item>
          <el-dropdown-item>
            <el-dropdown
              placement="left-start"
              @command="handleLanguageChange"
              @visible-change="handleDropdownVisibleChange"
            >
              {{ $t("ACCOUNT_MANAGEMENT_LANG") }}
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="item in langOptions"
                    :key="item.id"
                    :disabled="appStore.language === item.id"
                    :command="item.id"
                  >
                    <img class="w-[20px] mr-1" :src="flagMap[item.id]" />
                    {{ item.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

  <UpdatePasswordDialog
    v-model:showModel="showChangePassword"
    :allowClear="true"
    @handleCloseDialog="showChangePassword = false"
  />
</template>
<script setup lang="ts">
import {
  useUserStore,
  useTagsViewStore,
  useUserStoreHook,
  useLoadingStore,
  useAppStore,
} from "@/store";
import arrowIcon from "@/assets/icons/Arrow.png";
import avatar from "@/assets/images/avatar.png";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import deFlag from "@/assets/country/0.jpg";
import enFlag from "@/assets/country/1.jpg";
import esFlag from "@/assets/country/2.jpg";
import itFlag from "@/assets/country/3.jpg";
import jaFlag from "@/assets/country/4.jpg";
import ruFlag from "@/assets/country/5.jpg";
import cnFlag from "@/assets/country/6.jpg";
import twFlag from "@/assets/country/7.jpg";
import AccountManagementAPI from "@/api/account_management.api";
const { locale } = useI18n();
const flagMap: Record<number, string> = {
  0: deFlag,
  1: enFlag,
  2: esFlag,
  3: itFlag,
  4: jaFlag,
  5: ruFlag,
  6: cnFlag,
  7: twFlag,
};

const showChangePassword = ref(false);
const changePassword = () => {
  showChangePassword.value = true;
};

const handleLanguageChange = (lang: number) => {
  AccountManagementAPI.lang({ lang })
    .then(({ result, msg }) => {
      if (!result) {
        console.error("Error changing language:", msg);
        return;
      }
      locale.value = lang.toString();
      appStore.changeLanguage(lang);
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error changing language:", error);
    });
};

const langOptions = ref<EnumVO[]>([] as EnumVO[]);
const userStore = useUserStore();
const user = useUserStoreHook();
const userName = computed(() => user.userInfo?.user_name || "未命名使用者");
const appStore = useAppStore();
const tagsViewStore = useTagsViewStore();

const route = useRoute();
const router = useRouter();
const dropdownVisible = ref(false);

const handleDropdownVisibleChange = (visible: boolean) => {
  dropdownVisible.value = visible;
};

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
const { setLoading } = useLoadingStore();
const getInitialData = async () => {
  setLoading(true);
  try {
    const [langs] = await Promise.all([EnumAPI.get("Language")]);
    langOptions.value = langs;
  } catch {
    console.error("Failed to fetch language options.");
  } finally {
    setLoading(false);
  }
};

watch(
  () => user.userInfo?.user_name,
  (newValue) => {
    if (newValue) {
      getInitialData();
    }
  },
  {
    immediate: true,
  }
);
</script>
<style lang="scss">
.el-dropdown-menu__item:not(.is-disabled):focus,
.el-dropdown-menu__item:not(.is-disabled):hover {
  background: initial;
  color: #8980fc;
}
</style>
