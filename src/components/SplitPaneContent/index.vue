<template>
  <div class="split-pane overflow-hidden">
    <TagsView v-if="showTagsView" />
    <section>
      <router-view v-slot="{ Component, route }">
        <KeepAlive exclude="dashboard">
          <component :is="Component" :key="route.fullPath + paneKey" />
        </KeepAlive>
      </router-view>
    </section>
  </div>
</template>

<script setup lang="ts">
import TagsView from "@/layout/components/TagsView/index.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";
// 傳入每個 pane 自己的 key（避免 key 重複）
defineProps<{
  paneKey: string;
}>();

const route = useRoute();
const showTagsView = computed(() => route.meta?.showTagsView !== false);
</script>
