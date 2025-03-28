<template>
  <div>
    <el-scrollbar>
      <SidebarMenu :data="permissionStore.routes" base-path="" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { usePermissionStore } from "@/store";

const permissionStore = usePermissionStore();
</script>
