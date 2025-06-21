<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="CMS_SYSTEM_LOG"></PageTitle>
  <div class="p-8">
    <DataTable
      :rowData="dataAry"
      :columns="columns"
      :records_total="total"
      :queryParams="queryParams"
      @updateDataTable="updateDataTable"
    >
      <template #dateFilter>
        <DateTimeFilter
          :startDateTime="queryParams.start_datetime"
          :endDateTime="queryParams.end_datetime"
          :dateMode="queryParams.date_mode"
          @updateDateTime="updateDataTable"
        />
      </template>

      <template #searchFilter>
        <div
          class="space-y-2 items-center xl:flex xl:space-y-0 xl:space-x-2 2xl:flex-col 2xl:space-x-0 2xl:space-y-2 2xl:items-end 2xl:absolute 2xl:right-0 2xl:-bottom-10 2xl:z-1"
        >
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-select
              v-model="module"
              :placeholder="$t('CMS_SYSTEM_LOG_MODULE')"
              :clearable="true"
              filterable
              size="large"
            >
              <el-option
                v-for="item in modules"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-model="action"
              :placeholder="$t('CMS_SYSTEM_LOG_ACTION')"
              :clearable="true"
              size="large"
            >
              <el-option
                v-for="item in actions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </div>
          <div class="space-y-2 md:flex md:space-y-0 md:space-x-2 w-full md:w-[400px]">
            <el-input
              v-model="queryParams.create_user_name"
              class="h-[40px]! min-w-[220px]"
              :placeholder="$t('CMS_SYSTEM_LOG_CREATE_USER')"
            ></el-input>
          </div>
          <div class="flex space-x-2 pb-2 lg:pb-0">
            <SearchButtons @reset="resetSearch" @search="updateDataTable" />
          </div>
        </div>
      </template>
    </DataTable>
  </div>
  <el-dialog v-model="dialogVisible" width="60%" :before-close="handleCloseDialog">
    <pre class="whitespace-pre-wrap break-all text-sm max-h-[50vh] overflow-y-scroll">{{
      dialogContent
    }}</pre>
  </el-dialog>

  <el-dialog v-model="dialogDiffVisible" width="60%" :before-close="handleCloseDiffDialog">
    <div class="max-h-[30vh] overflow-y-scroll flex">
      <div class="flex-1">
        <span>{{ $t("CMS_SYSTEM_LOG_BEFORE_DATA") }}</span>
        <pre class="whitespace-pre-wrap break-all text-sm">{{ dialogDiffContent?.before }}</pre>
      </div>
      <div class="flex-1">
        <span>{{ $t("CMS_SYSTEM_LOG_AFTER_DATA") }}</span>
        <pre class="whitespace-pre-wrap break-all text-sm">{{ dialogDiffContent?.after }}</pre>
      </div>
    </div>
    <div v-if="dialogDiffContent?.type == 4" class="max-h-[20vh] overflow-y-scroll mt-4 ml-[20%]">
      <div class="w-full" v-html="deltaHtml"></div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import $ from "jquery";
import dayjs from "dayjs";
import OperationLogAPI, { OperationLogPageQuery, OperationLogVO } from "@/api/operation_log.api";
import { useLoadingStore } from "@/store";
import EnumAPI, { EnumVO } from "@/api/enum.api";
import { appConfig } from "@/utils/config";
import { getDataErrorAlert, actionErrorAlert } from "@/utils/message";
import { create } from "jsondiffpatch";
// @ts-ignore
import * as htmlFormatter from "jsondiffpatch/formatters/html";
import { getAccessToken } from "@/utils/auth";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const dialogVisible = ref(false); // 控制弹窗显示
const dialogContent = ref(""); // 存储弹窗中的内容

const jsondiffpatch = create();
const deltaHtml = ref("");

const showContentInDialog = (content: string) => {
  dialogContent.value = content;
  dialogVisible.value = true; // 打开弹窗
};

const dialogDiffVisible = ref(false);
const dialogDiffContent = ref<{
  before: object;
  after: object;
  type: number;
} | null>(null);
const showContentDiffInDialog = (before: object, after: object, type: number) => {
  dialogDiffContent.value = {
    before,
    after,
    type,
  };
  try {
    const delta = jsondiffpatch.diff(before, after);
    deltaHtml.value = htmlFormatter.format(delta, before);
  } catch (e) {
    console.log(e);
  }

  dialogDiffVisible.value = true;
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
};

const handleCloseDiffDialog = () => {
  dialogDiffVisible.value = false;
};

const { setLoading } = useLoadingStore();
const total = ref(0);
const dataAry = ref<OperationLogVO[]>([] as OperationLogVO[]);
const queryParams = reactive<OperationLogPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  date_mode: "D",
  module: null,
  action: null,
  create_user_name: null,
});

const action = computed({
  get: () => queryParams.action ?? "",
  set: (value) => {
    queryParams.action = value;
  },
});

const module = computed({
  get: () => queryParams.module ?? "",
  set: (value) => {
    queryParams.module = value;
  },
});

const resetSearch = () => {
  Object.assign(queryParams, {
    module: null,
    action: null,
    create_user_name: null,
  });
};

const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

const getColumns = () => [
  { data: "null", visible: false },
  { data: "id", visible: false },
  {
    data: "module",
    title: t("CMS_SYSTEM_LOG_MODULE"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: OperationLogVO) => _row.module_name,
  },
  {
    data: "action",
    title: t("CMS_SYSTEM_LOG_ACTION"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: OperationLogVO) => _row.action_name,
  },
  {
    data: "success",
    title: t("CMS_SYSTEM_LOG_SUCCESS"),
  },
  {
    data: "request_url",
    title: t("CMS_SYSTEM_LOG_REQUEST_URL"),
    className: "text-center!",
    render: (_data: string, _name: string, _row: OperationLogVO) => {
      // Conditional background class based on row success value
      const buttonClass = !_row.success
        ? "bg-red-500 hover:bg-red-600"
        : "bg-blue-500 hover:bg-blue-600";

      return _row.action === 2
        ? `
          <div class="flex flex-col items-start space-y-1 max-w-[400px] break-words text-center!">
            <button
              class="text-white px-3 py-1 text-xs rounded m-auto cursor-pointer ${buttonClass} download-button"
              data-url="${_data}"
              title="${_data}"
            >
              ${t("BUTTON_DOWNLOAD")}
            </button>
          </div>
        `
        : _data;
    },
  },
  {
    data: "request_body",
    title: t("CMS_SYSTEM_LOG_REQUEST_BODY"),
    render: (_data: string) => `
      <div class=" max-w-[200px] truncate! cursor-pointer show-content" title='${_data}' data-content='${_data}'>
        ${_data ?? ""}
      </div>
    `,
  },
  {
    data: "response_body",
    title: t("CMS_SYSTEM_LOG_RESPONSE_BODY"),
    render: (_data: string) => `
      <div class=" max-w-[200px] truncate! cursor-pointer show-content" title='${_data}' data-content='${_data}'>
        ${_data ?? ""}
      </div>
    `,
  },
  {
    data: "before_data",
    title: t("CMS_SYSTEM_LOG_BEFORE_DATA"),
    render: (_data: string, _name: string, _row: OperationLogVO) => `
      <div class=" max-w-[200px] truncate! cursor-pointer show-content-diff" title='${_data}' data-content='${_data}' data-before='${_data}' data-after='${_row.after_data}' data-type='${_row.action}'>
        ${_data ?? ""}
      </div>
    `,
  },
  {
    data: "after_data",
    title: t("CMS_SYSTEM_LOG_AFTER_DATA"),
    render: (_data: string, _name: string, _row: OperationLogVO) => `
      <div class=" max-w-[200px] truncate! cursor-pointer show-content-diff" title='${_data}' data-content='${_data}' data-before='${_row.before_data}' data-after='${_data}' data-type='${_row.action}'>
        ${_data ?? ""}
      </div>
    `,
  },
  {
    data: "create_user",
    title: t("CMS_SYSTEM_LOG_CREATE_USER"),
    className: "text-left!",
    render: (_data: number, _name: string, _row: OperationLogVO) => _row.create_user_name,
  },
  {
    data: "create_time",
    title: t("CMS_SYSTEM_LOG_CREATE_TIME"),
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
              <span>${date[0]}</span>
              <span>${date[1]}</span>
            </div>`;
    },
  },
  {
    data: "ip",
    title: t("CMS_SYSTEM_LOG_IP"),
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  OperationLogAPI.get(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data;
        total.value = records_total;
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_CMS_SYSTEM_LOG");
    })
    .finally(() => {
      setLoading(false);
    });
}

const actions = ref<EnumVO[]>([] as EnumVO[]);
const modules = ref<EnumVO[]>([] as EnumVO[]);
const getInitialData = async () => {
  setLoading(true);
  try {
    const [operationLogActions, moduleTypes] = await Promise.all([
      EnumAPI.get("OperationLogAction"),
      OperationLogAPI.modules(),
    ]);

    actions.value = operationLogActions;
    modules.value = moduleTypes;
  } catch {
    getDataErrorAlert(t, "PAGE_CMS_SYSTEM_LOG");
  } finally {
    setLoading(false);
  }
};

const route = useRoute();
const bindingEvent = () => {
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .download-button`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .download-button`,
      function () {
        const url = $(this).data("url");
        if (!url) return;

        fetch(`${appConfig.value.EXPORT_FILE_URL}${url}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        })
          .then((response) => response.blob())
          .then((blob) => {
            const a = document.createElement("a");
            const downloadUrl = URL.createObjectURL(blob);
            a.href = downloadUrl;
            a.download = "";
            a.click();
            URL.revokeObjectURL(downloadUrl);
          })
          .catch((error) => {
            actionErrorAlert(t, "BUTTON_DOWNLOAD");
            console.error("下載錯誤:", error);
          });
      }
    );

  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .show-content`)
    .on("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .show-content`, function () {
      const content = $(this).data("content");
      showContentInDialog(content);
    });

  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .show-content-diff`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .show-content-diff`,
      function () {
        const type = $(this).data("type");
        if (type === 4) {
          const before = $(this).data("before");
          const after = $(this).data("after");
          showContentDiffInDialog(before, after, type);
        } else {
          const content = $(this).data("content");
          showContentInDialog(content);
        }
      }
    );
};

onMounted(() => {
  getInitialData();
  handleQuery();

  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
<style>
.jsondiffpatch-delta {
  font-family: "Bitstream Vera Sans Mono", "DejaVu Sans Mono", Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0 0 0 12px;
  display: inline-block;
}
.jsondiffpatch-delta pre {
  font-family: "Bitstream Vera Sans Mono", "DejaVu Sans Mono", Monaco, Courier, monospace;
  font-size: 12px;
  margin: 0;
  padding: 0;
  display: inline-block;
}
ul.jsondiffpatch-delta {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-delta ul {
  list-style-type: none;
  padding: 0 0 0 20px;
  margin: 0;
}
.jsondiffpatch-added .jsondiffpatch-property-name,
.jsondiffpatch-added .jsondiffpatch-value pre,
.jsondiffpatch-modified .jsondiffpatch-right-value pre,
.jsondiffpatch-textdiff-added {
  background: #bbffbb;
  color: #000;
  padding: 0px 12px;
}
.jsondiffpatch-deleted .jsondiffpatch-property-name,
.jsondiffpatch-deleted pre,
.jsondiffpatch-modified .jsondiffpatch-left-value pre,
.jsondiffpatch-textdiff-deleted {
  background: #ffbbbb;
  color: #000;
  text-decoration: line-through;
  padding: 0px 12px;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination {
  color: gray;
}
.jsondiffpatch-unchanged,
.jsondiffpatch-movedestination > .jsondiffpatch-value {
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  overflow-y: hidden;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value,
.jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
  display: block;
}
.jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 100px;
}
.jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value {
  max-height: 0;
}
.jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,
.jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow {
  display: none;
}
.jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-property-name {
  display: inline-block;
  padding-right: 5px;
  vertical-align: top;
}
.jsondiffpatch-property-name:after {
  content: ": ";
}
.jsondiffpatch-child-node-type-array > .jsondiffpatch-property-name:after {
  content: ": [";
}
.jsondiffpatch-child-node-type-array:after {
  content: "],";
}
div.jsondiffpatch-child-node-type-array:before {
  content: "[";
}
div.jsondiffpatch-child-node-type-array:after {
  content: "]";
}
.jsondiffpatch-child-node-type-object > .jsondiffpatch-property-name:after {
  content: ": {";
}
.jsondiffpatch-child-node-type-object:after {
  content: "},";
}
div.jsondiffpatch-child-node-type-object:before {
  content: "{";
}
div.jsondiffpatch-child-node-type-object:after {
  content: "}";
}
.jsondiffpatch-value pre:after {
  content: ",";
}
li:last-child > .jsondiffpatch-value pre:after,
.jsondiffpatch-modified > .jsondiffpatch-left-value pre:after {
  content: "";
}
.jsondiffpatch-modified .jsondiffpatch-value {
  display: inline-block;
}
.jsondiffpatch-modified .jsondiffpatch-right-value {
  margin-left: 5px;
}
.jsondiffpatch-moved .jsondiffpatch-property-name {
  text-decoration: line-through;
  text-decoration-color: gray;
}
.jsondiffpatch-moved .jsondiffpatch-value {
  display: none;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination {
  display: inline-block;
  background: #ffffbb;
  color: #888;
}
.jsondiffpatch-moved .jsondiffpatch-moved-destination:before {
  content: " => ";
}
ul.jsondiffpatch-textdiff {
  padding: 0;
}
.jsondiffpatch-textdiff-location {
  color: #bbb;
  display: inline-block;
  min-width: 60px;
}
.jsondiffpatch-textdiff-line {
  display: inline-block;
}
.jsondiffpatch-textdiff-line-number:after {
  content: ",";
}
.jsondiffpatch-error {
  background: red;
  color: white;
  font-weight: bold;
}
</style>
