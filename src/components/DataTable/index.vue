<template>
  <div class="custom-table">
    <DataTable
      :columns="columns"
      :data="rowData"
      :options="tableOptions"
      @order="onOrderChange"
    ></DataTable>
    <div class="flex justify-center">
      <el-pagination
        v-model:current-page="tableOptions.currentPage"
        v-model:page-size="tableOptions.pageLength"
        layout="prev, pager, next, jumper"
        :total="recordsTotal"
      />
    </div>
  </div>
</template>

<script setup>
import $ from "jquery";
import { defineProps } from "vue";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";
import Select from "datatables.net-select";
import "datatables.net-colreorder";
import "datatables.net-buttons";
import "datatables.net-buttons/js/dataTables.buttons.min.js";
import "datatables.net-buttons/js/buttons.colVis.min.js";
import "datatables.net-buttons/js/buttons.html5.min.js";

DataTable.use(DataTablesCore);
DataTable.use(Select);

const onOrderChange = (newOrder) => {
  const [index, dir] = newOrder.dt.value.order()[0];
  tableOptions.order[0] = {
    name: props.columns[index].data,
    dir,
  };
};

const { t } = useI18n();

const emits = defineEmits(["updateDataTable"]);

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
  excelApiUrl: {
    type: String,
    default: () => "",
  },
  recordsTotal: {
    type: Number,
    required: true,
  },
  orderName: {
    type: String,
    default: () => "create_time",
  },
});

const tableOptions = reactive({
  lengthMenu: [5, 10, 25, 50, 100],
  autoWidth: true,
  fixedHeader: true,
  colReorder: true,
  pageLength: 25,
  currentPage: 1,
  searching: false,
  scrollX: true,
  info: false,
  order: [
    {
      name: props.orderName,
      dir: "desc",
    },
  ],
  layout: {
    topEnd: {
      buttons: [
        {
          extend: "colvis", // Column visibility button
          columns: ":not(:first)", // Only allow columns 1 and 2 to be toggled
        },
      ],
    },
  },
  select: {
    style: "multi",
    selector: 'input[type="checkbox"]', // Select checkboxes for row selection
    items: "row",
  },
  columnDefs: [
    {
      targets: 0,
      orderable: false,
      render: Select.render.select(),
    },
  ],
  language: {
    lengthMenu: `${t("DATA_TABLE_LENGTH_MENU")} _MENU_`,
    buttons: {
      colvis: "顯示全部選項",
    },
  },
});

if (props.excelApiUrl !== "") {
  tableOptions.layout.topEnd.buttons.push({
    text: "",
    className: "excel-btn",
    action: function () {
      // 在按钮点击时触发的动作
      alert("自定义按钮点击了!");
    },
  });
}

props.columns.forEach((e) => {
  e["name"] = e.data;
  e["orderSequence"] = ["asc", "desc"];
});

onMounted(() => {
  $("body").on("change", ".dt-length select", function (e) {
    tableOptions.pageLength = parseInt(e.target.value);
  });
});

watch(
  [
    () => tableOptions.pageLength,
    () => tableOptions.currentPage,
    () => tableOptions.order[0].name,
    () => tableOptions.order[0].dir,
  ],
  () => {
    const { name, dir } = tableOptions.order[0];
    emits("updateDataTable", {
      start: tableOptions.pageLength * (tableOptions.currentPage - 1),
      length: tableOptions.pageLength,
      sort: name,
      sort_dir: dir === "asc" ? 0 : 1,
    });
  }
);
</script>

<style scoped lang="scss">
.custom-table {
  :deep(.dataTable) {
    border-collapse: collapse;
  }
  :deep(table.dataTable > thead > tr > th) {
    white-space: nowrap;
    font-size: 14px;
    background: #2f3343;
    color: #fff;
    border: 1px solid #404145;
  }

  :deep(table.dataTable > tbody > tr > td) {
    font-size: 14px;
    border: 1px solid #404145;
  }

  :deep(table.dataTable > tbody > tr) {
    background: #212330;
  }

  :deep(table.dataTable > tbody > tr:nth-child(odd)) {
    background: #1b1d29;
  }

  :deep(table.dataTable > tbody > tr.selected > *) {
    box-shadow: none;
  }

  :deep(.dt-length) {
    .form-select {
      width: 120px;
      padding: 8px 32px 8px 12px;
      margin-left: 12px;
      border-radius: 4rem;
      background-color: #2f3343;
      border-color: #2f3343;
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background-image: url("/src/assets/icons/Arrow.png");
      background-position:
        right 0.5em top 50%,
        0 0;
      background-repeat: no-repeat, repeat;
      &:focus-visible {
        outline: none;
      }
    }
    color: #afb3d3;
    font-size: 14px;
  }
  :deep(.dt-layout-start) {
    display: inline-block;
  }
  :deep(.dt-layout-end) {
    display: inline-block;
  }

  :deep(div.dt-buttons > .dt-button) {
    border: none;
    background: #2f3343;
    border-radius: 4rem;
    padding: 8px 52px 8px 12px;
    font-size: 12px;
    line-height: initial;
    > .dt-button-down-arrow {
      display: none;
    }

    &.excel-btn {
      padding: 0px;
      position: relative;
      top: 14px;
      > span:first-child:after {
        display: none;
      }
      > span {
        width: 140px;
        height: 40px;
        display: block;
        background: none;
        background-image: url("/src/assets/images/excel-btn.png");
        background-repeat: no-repeat;
        background-position: center;
      }
    }

    > span:first-child:after {
      position: absolute;
      display: block;
      width: 12px;
      height: 12px;
      background-image: url("/src/assets/icons/Arrow.png");
      background-repeat: no-repeat;
      content: "";
      top: 8px;
      right: 15px;
    }
  }
  :deep(div.dt-buttons > .dt-button:hover:not(.disabled)) {
    background: initial;
  }

  :deep(.dt-paging) {
    display: none;
  }

  :deep(.is-in-pagination) {
    width: 80px;
  }
}
</style>
