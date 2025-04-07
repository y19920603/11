<template>
  <div class="container custom-table">
    <DataTable
      v-model:selection="selectedProducts"
      :value="rowData"
      showGridlines
      paginator
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50, 100]"
      stripedRows
      reorderableColumns
      scrollable
      scrollHeight="500px"
    >
      <template #header>
        <div style="text-align: left">
          <MultiSelect
            v-model="selectedColumns"
            :options="columns"
            optionLabel="header"
            @update:modelValue="onToggle"
          />
        </div>
      </template>
      <slot />
    </DataTable>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
import DataTable from "primevue/datatable";
import MultiSelect from "primevue/multiselect";

const selectedProducts = ref([]);
const selectedColumns = ref([]);

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  rowData: {
    type: Array,
    required: true,
  },
  columns: {
    type: Array,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.custom-table {
  :deep(.p-datatable-header-cell) {
    white-space: nowrap;
    background: #2f3343;
    color: #fff;
    border-color: #2f3343;
    font-size: 14px;
    text-algn: "center";
  }

  :deep(.p-datatable-column-sorted .p-datatable-sort-icon) {
    color: #fff;
  }

  :deep(.p-checkbox-box) {
    background: #2f3343;
  }

  :deep(.p-checkbox-checked .p-checkbox-box) {
    border-color: #625daf;
    background: #8980fc;
  }

  :deep(.p-checkbox-checked:not(.p-disabled):has(.p-checkbox-input:hover) .p-checkbox-box) {
    border-color: #625daf;
    background: #8980fc;
  }

  :deep(.p-datatable-tbody > tr) {
    background: #212330;
  }

  :deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr.p-row-odd) {
    background: #1b1d29;
  }

  :deep(.p-datatable-tbody > tr > td) {
    border-color: #404145;
    color: #fff;
    font-size: 14px;
  }
}
</style>
