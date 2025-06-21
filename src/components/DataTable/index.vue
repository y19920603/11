<template>
  <div
    class="flex justify-start items-center flex-col space-y-2 2xl:flex-row 2xl:min-h-[68px] relative"
  >
    <div id="dateFilter"><slot name="dateFilter" /></div>
    <div class="flex-1"></div>
    <div
      id="searchFilter"
      class="md:space-x-2 space-y-2 md:space-y-0 md:flex w-full md:w-auto justify-center items-center mb-2!"
    >
      <slot name="searchFilter" />
    </div>
  </div>
  <div class="custom-table">
    <DataTable
      :id="`tab_${route.query.tabId || route.meta.id}`"
      ref="dataTable"
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
        :total="records_total"
      />
    </div>
  </div>
</template>

<script setup>
import $ from "jquery";
import ActionButtons from "@/components/ActionButtons/index.vue";
import { defineProps } from "vue";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-bs5";

import Select from "datatables.net-select";
import "datatables.net-colreorder";
import "datatables.net-buttons";
import "datatables.net-buttons/js/dataTables.buttons.min.js";
import "datatables.net-buttons/js/buttons.colVis.min.js";
import "datatables.net-buttons/js/buttons.html5.min.js";
import ExcelAPI from "@/api/excel.api";
import setupPlugins from "@/plugins";

DataTable.use(DataTablesCore);
DataTable.use(Select);
const dataTable = ref();
const selectedID = ref([]);
const onOrderChange = (newOrder) => {
  const tableInstance = newOrder.dt.value;
  const [index, dir] = tableInstance.order()[0];
  const columnName = tableInstance.column(index).dataSrc(); // 正確取得排序欄位名稱

  tableOptions.order[0] = {
    name: columnName,
    dir,
  };
};
const { t } = useI18n();

const emits = defineEmits(["updateDataTable", "editHandler", "deleteHandler"]);

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
  records_total: {
    type: Number,
    required: true,
  },
  orderName: {
    type: String,
    default: () => "create_time",
  },
  orderDir: {
    type: String,
    default: () => "desc",
  },
  queryParams: {
    type: Object,
    required: true,
  },
  excelFileName: {
    type: String,
    default: () => "download",
  },
});

const route = useRoute();
const columnOrderStorageKey = `${route.meta.id}-order`;
const saveColumnOrderToStorage = (order) => {
  localStorage.setItem(columnOrderStorageKey, JSON.stringify(order));
};

const getColumnOrderFromStorage = () => {
  const stored = localStorage.getItem(columnOrderStorageKey);
  savedColumnOrder.value = stored ? JSON.parse(stored) : null;
};
const savedColumnOrder = ref();
getColumnOrderFromStorage();

const currentPage = computed(() => props.queryParams.start / props.queryParams.length + 1);
watch(currentPage, (newVal) => {
  tableOptions.currentPage = newVal;
});

const tableOptions = reactive({
  lengthMenu: [10, 25, 50, 100],
  autoWidth: true,
  fixedHeader: true,
  colReorder: {
    order: savedColumnOrder || undefined,
  },
  pageLength: props.queryParams.length ?? 25,
  currentPage: currentPage.value ?? 1,
  searching: false,
  scrollX: true,
  scrollY: true,
  info: false,
  order: [
    {
      name: props.orderName,
      dir: props.orderDir,
    },
    {
      name: "id",
      dir: "asc",
    },
  ],
  layout: {
    topEnd: {
      buttons: [
        {
          extend: "colvis",
          columns: ":gt(1)",
        },
      ],
    },
  },
  select: {
    style: "multi",
    selector: 'input[type="checkbox"]',
    items: "row",
  },
  columnDefs: [
    {
      targets: 0,
      orderable: false,
      // render: Select.render.select(),  // 需要全選在打開
      render: () => `<input type="checkbox" />`,
    },
  ],
  language: {
    lengthMenu: `${t("DATA_TABLE_LENGTH_MENU")} _MENU_`,
    buttons: {
      colvis: "顯示全部選項",
    },
  },
});

const isDownloading = ref(false);

if (props.excelApiUrl !== "") {
  tableOptions.layout.topEnd.buttons.push({
    text: "",
    className: "excel-btn",
    action: function () {
      if (isDownloading.value) {
        return;
      }

      isDownloading.value = true;

      const tableInstance = dataTable.value.dt;
      const visibleColumns = tableInstance.columns().visible().toArray();
      const columnNames = props.columns
        .map((column, index) => (visibleColumns[index] ? column.name : null))
        .filter(Boolean)
        .filter((name) => name !== "null");

      const allUseClientUid = props.rowData.every((row) => !row.id && row.client_uid);

      const exportParamKey = allUseClientUid ? "excel_client_uid" : "excel_id";

      ExcelAPI.Export(`/report${props.excelApiUrl}`, {
        ...props.queryParams,
        [exportParamKey]: selectedID.value.join(","),
        excel_title: columnNames.join(","),
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          const disposition = response.headers["content-disposition"];
          let filename = `${props.excelFileName}.xlsx`;

          if (disposition) {
            const utf8Match = disposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/);
            if (utf8Match?.[1]) {
              filename = decodeURIComponent(utf8Match[1]);
            } else {
              const asciiMatch = disposition.match(/filename="?([^"]+)"?/);
              if (asciiMatch?.[1]) {
                filename = asciiMatch[1];
              }
            }
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error) => {
          ElMessageBox.alert(`${t("MSG_DOWNLOAD_FAIL")}`, {
            confirmButtonText: t("BUTTON_CONFIRM"),
          });
          console.error("下載 Excel 失敗：", error);
        })
        .finally(() => {
          isDownloading.value = false;
        });
    },
  });
}

const onRowSelect = (_e, dt, _type, indexes) => {
  const selectedRowIndex = indexes[0];
  const selectedRowData = dt.row(selectedRowIndex).data();
  if (!selectedID.value.includes(selectedRowData.id)) {
    selectedID.value.push(selectedRowData.id);
  }
};

const onRowDeSelect = (_e, dt, _type, indexes) => {
  const selectedRowIndex = indexes[0];
  const selectedRowData = dt.row(selectedRowIndex).data();
  selectedID.value.splice(selectedID.value.indexOf(selectedRowData.id), 1);
};

const mountActionButtons = () => {
  document
    .querySelectorAll(`#tab_${route.query.tabId || route.meta.id}_wrapper .action-buttons`)
    .forEach((el) => {
      if (el.__vue_app__) {
        el.__vue_app__.unmount(); // 先清掉已經 mount 的
        delete el.__vue_app__;
      }

      const id = el.getAttribute("data-id");
      const field = el.getAttribute("data-field");
      const is_delete = el.getAttribute("data-delete");
      const rowData = props.rowData.find((item) => item.id == id);
      if (!rowData) return;

      const app = createApp(ActionButtons, {
        row: rowData,
        field,
        is_delete: is_delete === null,
        onEdit: (data) => emits("editHandler", data),
        onDelete: (data) => emits("deleteHandler", data),
      });
      app.use(setupPlugins);
      app.mount(el);
      el.__vue_app__ = app;
    });
};

onMounted(() => {
  bindTableEvents();

  $("button.buttons-colvis").on("click", () => {
    const $collection = $("button.buttons-colvis ~ .dt-button-collection");
    if ($collection.length > 0) {
      const minHeight = $collection[0].offsetHeight + 10;

      $(".dt-scroll-body").css("min-height", minHeight + "px");
    }
  });

  $.fn.dataTable.ext.type.order["zh-tw-string-pre"] = function (data) {
    const div = document.createElement("div");
    div.innerHTML = data ?? "";
    return div.textContent?.trim() || "";
  };

  $.fn.dataTable.ext.type.order["zh-tw-string-asc"] = function (a, b) {
    return a.localeCompare(b, "zh-Hant");
  };

  $.fn.dataTable.ext.type.order["zh-tw-string-desc"] = function (a, b) {
    return b.localeCompare(a, "zh-Hant");
  };
});
let isManualColumnReorder = false;
const bindTableEvents = () => {
  $("body").on(
    "change",
    `#tab_${route.query.tabId || route.meta.id}_wrapper .dt-length select`,
    function (e) {
      tableOptions.pageLength = parseInt(e.target.value);
    }
  );
  const tableInstance = dataTable.value.dt;
  tableInstance.on("select", onRowSelect);
  tableInstance.on("deselect", onRowDeSelect);

  tableInstance
    .table()
    .container()
    .addEventListener("mousedown", (e) => {
      if (e.target.closest("th")) {
        isManualColumnReorder = true;
      }
    });

  tableInstance
    .table()
    .container()
    .addEventListener("mouseup", (e) => {
      if (e.target.closest("th")) {
        isManualColumnReorder = false;
      }
    });

  tableInstance.on("column-reorder", function () {
    if (isManualColumnReorder) {
      const newOrder = tableInstance.colReorder.order();
      saveColumnOrderToStorage(newOrder);
      getColumnOrderFromStorage();
      nextTick(() => {
        mountActionButtons();
      });
    }
  });

  tableInstance.on("draw", () => {
    nextTick(() => {
      const tableInstance = dataTable.value.dt;
      const rows = tableInstance.rows().data();
      rows.toArray().forEach((rowData, index) => {
        if (selectedID.value.includes(rowData.id)) {
          tableInstance.row(index).select();
          const checkbox = tableInstance
            .cell(index, 0)
            .node()
            .querySelector("input[type='checkbox']");
          if (checkbox) {
            checkbox.checked = true;
          }
        }
      });
      mountActionButtons();
    });
  });
};

onActivated(() => {
  mountActionButtons();
});

onUnmounted(() => {
  $("body").off("change", `#tab_${route.query.tabId || route.meta.id}_wrapper .dt-length select`);
});

const eachColumn = () => {
  props.columns.forEach((e) => {
    e["name"] = e.data;
    e["orderSequence"] = ["asc", "desc"];
  });
};
eachColumn();

let prevColumns = JSON.stringify(props.columns);
watch(
  () => props.columns,
  async (newVal) => {
    const newColsStr = JSON.stringify(newVal);

    if (newColsStr !== prevColumns) {
      prevColumns = newColsStr;
      eachColumn();

      await nextTick();
      const table = dataTable.value?.dt;
      if (!table) return;

      table.clear(); // 清除資料
      table.destroy(); // 必要時，整個重建（若欄位差異太大）

      await nextTick();
      bindTableEvents(); // 重新綁事件
    }
  }
);

watch(
  [
    () => tableOptions.pageLength,
    () => tableOptions.currentPage,
    () => tableOptions.order[0].name,
    () => tableOptions.order[0].dir,
  ],
  ([newPageLength], [oldPageLength]) => {
    const { name, dir } = tableOptions.order[0];

    if (newPageLength !== oldPageLength) {
      tableOptions.currentPage = 1;
    }

    emits(
      "updateDataTable",
      {
        start: tableOptions.pageLength * (tableOptions.currentPage - 1),
        length: tableOptions.pageLength,
        sort: name,
        sort_dir: ["ip_check_fl", "ev_fl"].includes(name)
          ? dir !== "asc"
            ? 0
            : 1
          : dir === "asc"
            ? 0
            : 1,
      },
      newPageLength !== oldPageLength
    );
  }
);

watch(
  () => props.rowData,
  async () => {
    await nextTick();
    const table = dataTable.value?.dt;
    if (!table) return;

    table.clear();
    table.rows.add(props.rowData);

    const order = tableOptions.order.map((o) => {
      const table = dataTable.value?.dt;
      const colIndex = table
        .columns()
        .indexes()
        .toArray()
        .find((i) => table.column(i).dataSrc() === o.name);
      return [colIndex, o.dir];
    });
    table.order(order);

    table.draw(false);

    bindTableEvents();
  }
);
</script>

<style scoped lang="scss">
.custom-table {
  :deep(.dataTable) {
    border-collapse: collapse;
  }

  :deep(table.dataTable th.dt-type-numeric div.dt-column-header),
  :deep(table.dataTable th.dt-type-date div.dt-column-header) {
    flex-direction: row !important;
  }

  :deep(table.dataTable > thead > tr > th) {
    white-space: nowrap;
    font-size: 14px;
    background: var(--datatable-th);
    color: var(--datatable-text);
    border: 1px solid var(--datatable-border-color);
    border-bottom: 0px;
  }

  :deep(table.dataTable > tbody > tr > td) {
    font-size: 14px;
    border: 1px solid var(--datatable-border-color);
    white-space: nowrap;
  }

  :deep(table.dataTable > tbody > tr) {
    background: var(--datatable-tr);
  }

  :deep(table.dataTable > tbody > tr:nth-child(odd)) {
    background: var(--bg-contain);
  }

  :deep(table.dataTable > tbody > tr.selected > *) {
    box-shadow: none;
  }

  :deep(.dt-length) {
    .form-select {
      cursor: pointer;
      width: 120px;
      padding: 8px 32px 8px 12px;
      margin-left: 12px;
      border-radius: 4rem;
      background-color: var(--el-bg-color);
      border: var(--tag-border-active);
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
    background-color: var(--el-bg-color);
    border: var(--tag-border-active);
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
      background-image: url("@/assets/icons/Arrow.png");
      background-repeat: no-repeat;
      content: "";
      top: 8px;
      right: 15px;
    }
  }

  :deep(div.dt-buttons > .dt-button.excel-btn) {
    background: none;
    border: none;
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

  :deep(.dt-scroll-body) {
    max-height: 820px;
  }

  @media (max-width: 640px) {
    :deep(.el-pagination__jump) {
      display: none;
    }
  }
  :deep(.dt-layout-table) {
    margin-top: 16px;
  }

  :deep(div.dt-buttons > .dt-button:hover:not(.disabled)) {
    background: var(--el-bg-color);
  }
}
</style>
