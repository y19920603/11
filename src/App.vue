<template>
  <el-config-provider :locale="locale" :size="size">
    <template v-if="hasLayout">
      <Layout></Layout>
    </template>
    <template v-else>
      <router-view />
    </template>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store";
import { ComponentSize } from "@/enums/settings/layout.enum";
import Layout from "@/layout/index.vue";

const appStore = useAppStore();
const route = useRoute();
const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const hasLayout = computed(() => route.meta.layout !== false); // 默认需要 Layout，除非meta中设置 layout: false
</script>
