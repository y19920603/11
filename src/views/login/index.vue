<template>
  <div
    class="flex justify-center items-center w-full h-full p-5 overflow-y-auto bg-[url('@/assets/images/cms_login_bg.png')] bg-no-repeat bg-center bg-right"
  >
    <!-- 登录页内容 -->
    <div
      class="flex flex-col justify-center items-center space-y-2xl md:w-8/12 lg:w-5/12 xl:w-3/12 w-11/12"
    >
      <img :src="`src/assets/images/cms-logo.png`" class="h-[42px] w-[168px]" />
      <div class="p-10 bg-[#242735] rounded-xl w-full flex justify-center items-center">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginRules" class="w-full">
          <div class="flex justify-center flex-col items-center space-y-[8px]">
            <div class="text-[#8480FF] text-2xl">{{ $t("LOGIN_WELCOME") }}</div>
            <div class="text-white text-sm">{{ $t("LOGIN_WELCOME_SUB") }}</div>
          </div>
          <div class="mt-8 flex flex-col">
            <!-- 用户名 -->
            <el-form-item :label="`${$t('LOGIN_EMAIL')}`" label-position="top" prop="email">
              <div class="w-full">
                <el-input
                  ref="email"
                  v-model="loginFormData.email"
                  :placeholder="$t('LOGIN_EMAIL_PLACEHOLDER')"
                  name="username"
                  size="large"
                  class="h-[40px]"
                />
              </div>
            </el-form-item>

            <!-- 密码 -->
            <el-form-item :label="`${$t('LOGIN_PASSWORD')}`" label-position="top" prop="password">
              <div class="w-full">
                <el-input
                  v-model="loginFormData.password"
                  :placeholder="$t('LOGIN_PASSWORD_PLACEHOLDER')"
                  type="password"
                  name="password"
                  size="large"
                  class="h-[40px]"
                  show-password
                  @keyup.enter="handleLoginSubmit"
                />
              </div>
            </el-form-item>

            <div class="text-[#f56c6c] text-sm my-2">{{ errorMsg }}</div>

            <div class="w-full py-1 flex-x-between">
              <el-checkbox>
                {{ $t("LOGIN_REMEMBER_ACCOUNT") }}
              </el-checkbox>
            </div>

            <!-- 登录按钮 -->
            <el-button
              class="w-auto mt-4 self-center bg-gradient-to-b from-[#7E90FF] to-[#604CD6]"
              :loading="loading"
              size="large"
              round
              @click.prevent="handleLoginSubmit"
            >
              {{ $t("LOGIN_LOGIN_TEXT") }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LocationQuery, RouteLocationRaw, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { errorObj, type LoginFormData } from "@/api/auth.api";
import router from "@/router";

import type { FormInstance } from "element-plus";

import { useUserStore } from "@/store";

const userStore = useUserStore();

const route = useRoute();
const { t } = useI18n();
const loginFormRef = ref<FormInstance>();
const errorMsg = ref("");

const loading = ref(false);

const loginFormData = ref<LoginFormData>({
  email: "",
  password: "",
});

const loginRules = computed(() => {
  return {
    email: [
      {
        required: true,
        trigger: "blur",
        message: t("MSG_REQUIRED", { field: t("LOGIN_EMAIL") }),
      },
      {
        pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        trigger: "blur",
        message: t("MSG_FORMAT_ERROR", { field: t("LOGIN_EMAIL") }),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("MSG_REQUIRED", { field: t("LOGIN_PASSWORD") }),
      },
    ],
  };
});

async function handleLoginSubmit() {
  try {
    await loginFormRef.value?.validate();
  } catch {
    return;
  }

  loading.value = true;
  try {
    await userStore.login(loginFormData.value);

    // await userStore.getUserInfo();

    const redirect = resolveRedirectTarget(route.query);
    await router.push(redirect);
  } catch (error) {
    errorMsg.value = (error as errorObj[])[0].message;
  } finally {
    loading.value = false;
  }
}

function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  const defaultPath = "/";

  const rawRedirect = (query.redirect as string) || defaultPath;

  try {
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query,
    };
  } catch {
    return { path: defaultPath };
  }
}
</script>
