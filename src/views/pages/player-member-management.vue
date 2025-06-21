<!-- eslint-disable no-unused-vars -->
<template>
  <PageTitle title="PLAYER_MEMBER_MANAGEMENT"></PageTitle>
  <div class="py-4 px-4">
    <PageSummary :items="summaryAry" />
  </div>
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
          @updateDateTime="updateDataTable"
        />
      </template>
      <template #searchFilter>
        <el-popover
          class="box-item"
          :width="220"
          :content="$t('PLAYER_MEMBER_MANAGEMENT_SEARCH_POPOVER_CONTENT')"
          placement="top-start"
        >
          <template #reference>
            <el-input
              v-model="queryParams.search"
              class="min-w-[220px]! h-[40px]!"
              size="large"
              :placeholder="$t('AGENT_PROFIT_KEY_SEARCH_PLACEHOLDER')"
            ></el-input>
          </template>
        </el-popover>
        <SearchButtons :resetBtn="false" @search="updateDataTable" />
      </template>
    </DataTable>
  </div>

  <template v-if="masterSplit">
    <el-dialog
      v-model="showMaterSplitDialog"
      :title="masterSplit.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="masterSplitCloseHandler"
    >
      <el-form
        ref="masterSplitFormRef"
        :model="masterSplit"
        :rules="masterSplitRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item prop="value" :label="$t('PLAYER_MEMBER_MANAGEMENT_MASTER_SPLIT_NUMBER')">
          <el-input-number
            v-model="masterSplit.value"
            class="w-full!"
            type="number"
            :min="0"
            :max="50"
            :step="1"
          />
          <span class="text-[12px] text-red">{{ $t("PLAYER_MEMBER_MANAGEMENT_SEARCH_HINT") }}</span>
        </el-form-item>
        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="masterSplit.password"
            show-password
            type="password"
            @blur="clearMasterSplitError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="masterSplitCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="masterSplitSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <template v-if="kickPlayOut">
    <el-dialog
      v-model="showKickPlayOutDialog"
      :title="kickPlayOut.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="kickPlayOutCloseHandler"
    >
      <el-form
        ref="kickPlayOutFormRef"
        :model="kickPlayOut"
        :rules="kickPlayOutRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="kickPlayOut.password"
            show-password
            type="password"
            @blur="clearKickPlayOutError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="kickPlayOutCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="kickPlayOutSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <template v-if="playerAddGold">
    <el-dialog
      v-model="showPlayerAddGoldDialog"
      :title="playerAddGold.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="playerAddGoldCloseHandler"
    >
      <el-form
        ref="playerAddGoldFormRef"
        :model="playerAddGold"
        :rules="playerAddGoldRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item prop="new_gold" :label="$t('PLAYER_MEMBER_MANAGEMENT_CURRENT_DOLLARS')">
          <div
            class="border border-[gray] w-full rounded px-2 text-center text-blue-500"
            :class="{ 'text-red-500': playerAddGold.new_gold < 0 }"
          >
            {{ playerAddGold.new_gold }}
          </div>
        </el-form-item>
        <el-form-item prop="value" :label="$t('PLAYER_MEMBER_MANAGEMENT_ADJUST_GOLD')">
          <el-input-number v-model="playerAddGold.value" class="w-full!" type="number" :step="1" />
        </el-form-item>
        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="playerAddGold.password"
            show-password
            type="password"
            @blur="clearPlayerAddGoldError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="playerAddGoldCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="playerAddGoldSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>

  <template v-if="statusObj">
    <el-dialog
      v-model="showStatusObjDialog"
      :title="statusObj.title"
      class="w-[90vw]! md:w-[600px]!"
      @closed="statusObjCloseHandler"
    >
      <el-form
        ref="statusObjFormRef"
        :model="statusObj"
        :rules="statusObjRules"
        label-width="80px"
        label-position="top"
      >
        <el-form-item prop="value" :label="$t('PLAYER_MEMBER_MANAGEMENT_FREEZE_EXPIRY_DATE')">
          <el-date-picker
            v-model="statusObj.value"
            type="datetime"
            class="w-full!"
            value-format="YYYY-MM-DD HH:mm:ss"
            :readonly="freeze"
          />
        </el-form-item>
        <el-form-item
          :label="$t('PLAYER_MEMBER_MANAGEMENT_PERMANENT_FREEZE')"
          label-position="left"
          class="flex items-center"
        >
          <el-switch
            v-model="freeze"
            size="large"
            width="60"
            inline-prompt
            :active-text="$t('SWITCH_OPEN')"
            :inactive-text="$t('SWITCH_CLOSE')"
          />
        </el-form-item>
        <el-form-item prop="password" :label="$t('GAME_SERVER_STATUS_PASSWORD')">
          <el-input
            v-model="statusObj.password"
            show-password
            type="password"
            @blur="clearStatusObjError('password')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer flex justify-center space-x-10">
          <el-button class="px-10" type="info" @click="statusObjCloseHandler">
            {{ $t("BUTTON_CLOSE") }}
          </el-button>
          <el-button class="px-10" type="primary" @click="statusObjSaveHandler">
            {{ $t("BUTTON_SAVE") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import $ from "jquery";
import AccountAPI, { AccountPageQuery, AccountVO } from "@/api/player-member-management.api";
import { SummaryItemVO } from "@/api/types/summary";
import { getDataErrorAlert } from "@/utils/message";
import { useLoadingStore, usePermissionStore } from "@/store";
import { useCountryTypes } from "@/utils/countryTypes";
import { FormInstance, FormRules } from "element-plus";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import AuthAPI from "@/api/auth.api";
import { appConfig } from "@/utils/config";

const { t, locale } = useI18n();

watch(locale, () => {
  columns.value = getColumns();
  updateDataTable({}, false);
});

const { setLoading } = useLoadingStore();
const total = ref(0);
const summaryAry = ref<SummaryItemVO[]>([] as SummaryItemVO[]);
const dataAry = ref<AccountVO[]>([] as AccountVO[]);
const queryParams = reactive<AccountPageQuery>({
  start_datetime: `${dayjs().subtract(1, "month").startOf("day").format("YYYY-MM-DD HH:mm:ss")}`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  start: 0,
  length: 25,
  sort: "create_time",
  sort_dir: 1,
  search: null,
  ga_id: null,
  agent_id: null,
  nickname: null,
});
const countryAry = useCountryTypes();
const updateDataTable = (data: any = {}, restart: boolean = true) => {
  if (restart) {
    data = { ...data, start: 0 };
  }
  Object.assign(queryParams, data);
  handleQuery();
};

const permissionStore = usePermissionStore();
console.log(permissionStore.userPermissions);

const getColumns = () => [
  { data: "null", visible: false },
  { data: "id", visible: false },
  { data: "client_uid", title: t("PLAYER_MEMBER_MANAGEMENT_CLIENT_UID"), className: "text-left!" },
  { data: "account", title: t("PLAYER_MEMBER_MANAGEMENT_ACCOUNT") },
  { data: "nickname", title: t("PLAYER_MEMBER_MANAGEMENT_NICKNAME") },
  { data: "agent_name", title: t("PLAYER_MEMBER_MANAGEMENT_AGENT_NAME") },
  {
    data: "create_time",
    title: t("PLAYER_MEMBER_MANAGEMENT_CREATE_TIME"),
    className: "text-left!",
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
          <span>${date[0]}</span>
          <span>${date[1]}</span>
        </div>`;
    },
  },
  {
    data: "coin",
    title: t("PLAYER_MEMBER_MANAGEMENT_GOLD_1"),
    render: (data: string, _name: string, row: AccountVO) =>
      `<a class="text-blue" href="/player-balance-log/${row.client_uid}">${data}</a>`,
  },
  { data: "ex_coin", title: t("PLAYER_MEMBER_MANAGEMENT_GOLD_0") },
  { data: "diamond", title: t("PLAYER_MEMBER_MANAGEMENT_GOLD_3") },
  { data: "dead_chips", title: t("PLAYER_MEMBER_MANAGEMENT_GOLD_2") },
  { data: "company_name", title: t("PLAYER_MEMBER_MANAGEMENT_COMPANY_NAME") },
  {
    data: "master_split",
    title: t("PLAYER_MEMBER_MANAGEMENT_MASTER_SPLIT"),
    className: "text-center! ",
    render: (data: string, _name: string, row: AccountVO) => {
      return `<div class='flex flex-col justify-start bg-primary hover:bg-blue-600 text-white rounded-full py-1 cursor-pointer master_split'
                data-id="${row.uid}"
                data-value="${data}"
                data-client="${row.client_uid}"
              >
                ${data}
              </div>`;
    },
  },
  {
    data: "last_login_time",
    title: t("PLAYER_MEMBER_MANAGEMENT_LAST_LOGIN_TIME"),
    className: "text-left!",
    render: (data: string) => {
      const date = data.split(" ");
      return `<div class='flex flex-col justify-start'>
          <span>${date[0]}</span>
          <span>${date[1]}</span>
        </div>`;
    },
  },
  {
    data: "country_code",
    title: t("PLAYER_MEMBER_MANAGEMENT_COUNTRY_CODE"),
    render: (data: string) => {
      const country = countryAry.find((e) => e.value === data);
      return country ? `[${country?.value}] ${country?.name}` : data;
    },
  },
  {
    data: "status",
    title: t("PLAYER_MEMBER_MANAGEMENT_STATUS"),
    className: "text-center!",
    render: (_data: string, _name: string, row: AccountVO) => {
      return `
          <div class="rounded-full px-4 py-1 text-center cursor-pointer text-white status ${_data == "1" ? "bg-[#34c38f] hover:bg-[#2ca67a]" : "bg-[#f46a6a] hover:bg-[#cf5a5a]"}"
            data-id="${row.uid}"
            data-value="${row.freeze_time}"
            data-client="${row.client_uid}"
          >
            ${row.status_name ?? _data}
          </div>
        `;
    },
  },
  { data: "ip", title: t("PLAYER_MEMBER_MANAGEMENT_IP") },
  {
    visible: permissionStore.userPermissions.includes("account_kick_out"),
    data: "last_update_time",
    title: t("PLAYER_MEMBER_MANAGEMENT_KICK_PLAYER_OUT"),
    sortable: false,
    className: "text-center!",
    render: (data: string, _name: string, row: AccountVO) => {
      return `<div class='flex flex-col justify-start bg-[#f46a6a] rounded-full py-1 px-4 cursor-pointer kick_player_out text-white'
                  data-id="${row.uid}"
                  data-client="${row.client_uid}"
              >
                ${t("PLAYER_MEMBER_MANAGEMENT_KICK_PLAYER_OUT")}
              </div>`;
    },
  },
  {
    visible: permissionStore.userPermissions.includes("player_game_gold"),
    data: "uid",
    title: t("PLAYER_MEMBER_MANAGEMENT_ADD_GOLD"),
    sortable: false,
    className: "text-center!",
    render: (data: string, _name: string, row: AccountVO) => {
      return `<div class='flex flex-col justify-start bg-gray-500 hover:bg-gray-600 rounded-full py-1 px-4 cursor-pointer add_gold text-white'
              data-value="${row.coin_value}"
              data-id="${row.uid}"
              data-client="${row.client_uid}">
        ${t("BUTTON_EDIT")}
      </div>`;
    },
  },
  {
    data: "",
    title: t("PLAYER_MEMBER_MANAGEMENT_VIEW"),
    sortable: false,
    className: "text-center!",
    render: (_data: string, _name: string, row: AccountVO) => {
      return `
        <a href="/player-balance-log/${row.client_uid}">
          <div class="rounded-full px-4 py-1 text-center cursor-pointer bg-[#007bff] hover:bg-[#0069d9] text-white" >
            ${t("PLAYER_MEMBER_MANAGEMENT_VIEW")}
          </div>
        </a>
      `;
    },
  },
];
const columns = ref(getColumns());

function handleQuery() {
  setLoading(true);
  AccountAPI.getAll(queryParams)
    .then(({ result, data, records_total }) => {
      if (result) {
        dataAry.value = data.map((e) => ({ ...e, id: e.uid }));
        total.value = records_total;
        summaryAry.value = [
          {
            title: "PLAYER_MEMBER_MANAGEMENT_REGISTER_TOTAL_PLAYERS",
            value: records_total,
            previous: "",
            increase: "",
            trend: "",
            imageSrc: "total-player",
          },
        ];
      }
    })
    .catch(() => {
      getDataErrorAlert(t, "PAGE_PLAYER_MEMBER_MANAGEMENT");
    })
    .finally(() => {
      setLoading(false);
    });
}

const isSubmit = ref(false);

// MasterSplit
const clearMasterSplitError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(masterSplitFormRef.value, masterSplitRules, field);
  }
};
const masterSplitSaveHandler = async () => {
  if (!masterSplitFormRef.value) return;

  await masterSplitFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...masterSplit.value };

      const { result, errors, msg } = await AccountAPI.setMasterSplit({
        uid: dataToSubmit.uid!,
        master_split: dataToSubmit.value!,
        password: encrypt.encrypt(dataToSubmit.password!) as string,
      });
      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(masterSplitFormRef.value, masterSplitRules, errors);
        }
      } else {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      masterSplitCloseHandler();
      handleQuery();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const masterSplitCloseHandler = () => {
  masterSplit.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(masterSplitRules);
};
const showMaterSplitDialog = computed(() => (masterSplit.value && masterSplit.value.show) ?? false);
const masterSplit = ref<null | {
  uid: string | number;
  value: number;
  show: boolean;
  title: string;
  password: string;
}>(null);
const masterSplitFormRef = ref<FormInstance>();
const masterSplitRules: FormRules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
});

// KICK PLAYER OUT
const clearKickPlayOutError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(kickPlayOutFormRef.value, kickPlayOutRules, field);
  }
};
const kickPlayOutSaveHandler = async () => {
  if (!kickPlayOutFormRef.value) return;

  await kickPlayOutFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...kickPlayOut.value };

      const { result, errors, msg } = await AccountAPI.kickPlayer({
        uid: dataToSubmit.uid!,
        password: encrypt.encrypt(dataToSubmit.password!) as string,
      });
      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(kickPlayOutFormRef.value, kickPlayOutRules, errors);
        }
      } else {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      kickPlayOutCloseHandler();
      handleQuery();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const kickPlayOutCloseHandler = () => {
  kickPlayOut.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(kickPlayOutRules);
};
const showKickPlayOutDialog = computed(
  () => (kickPlayOut.value && kickPlayOut.value.show) ?? false
);
const kickPlayOut = ref<null | {
  uid: string | number;
  show: boolean;
  title: string;
  password: string;
}>(null);
const kickPlayOutFormRef = ref<FormInstance>();
const kickPlayOutRules: FormRules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
});

// Player Add Gold
const clearPlayerAddGoldError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(playerAddGoldFormRef.value, playerAddGoldRules, field);
  }
};
const playerAddGoldSaveHandler = async () => {
  if (!playerAddGoldFormRef.value) return;

  await playerAddGoldFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...playerAddGold.value };

      const { result, errors, msg } = await AccountAPI.addGold({
        uid: dataToSubmit.uid!,
        add_gold: dataToSubmit.value!,
        password: encrypt.encrypt(dataToSubmit.password!) as string,
      });
      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(playerAddGoldFormRef.value, playerAddGoldRules, errors);
        }
      } else {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      playerAddGoldCloseHandler();
      handleQuery();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const playerAddGoldCloseHandler = () => {
  playerAddGold.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(playerAddGoldRules);
};
const showPlayerAddGoldDialog = computed(
  () => (playerAddGold.value && playerAddGold.value.show) ?? false
);
const playerAddGold = ref<null | {
  uid: string | number;
  old_gold: number;
  new_gold: number;
  value: number;
  show: boolean;
  title: string;
  password: string;
}>(null);
watch(
  () => playerAddGold.value?.value,
  (newVal) => {
    if (playerAddGold.value) {
      playerAddGold.value.new_gold = playerAddGold.value.old_gold + newVal!;
    }
  },
  { immediate: true }
);
const playerAddGoldFormRef = ref<FormInstance>();
const playerAddGoldRules: FormRules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
});

// StatusObj
const clearStatusObjError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(statusObjFormRef.value, statusObjRules, field);
  }
};
const statusObjSaveHandler = async () => {
  if (!statusObjFormRef.value) return;

  await statusObjFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    try {
      const encrypt = await AuthAPI.getKey();
      const dataToSubmit = { ...statusObj.value };

      const { result, errors, msg } = await AccountAPI.freezePlayer({
        uid: dataToSubmit.uid!,
        freeze_datetime: dataToSubmit.value!,
        password: encrypt.encrypt(dataToSubmit.password!) as string,
      });
      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(statusObjFormRef.value, statusObjRules, errors);
        }
      } else {
        await ElMessageBox.alert(msg, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      statusObjCloseHandler();
      handleQuery();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
};
const statusObjCloseHandler = () => {
  statusObj.value = null;
  isSubmit.value = false;
  clearAllCustomValidators(statusObjRules);
};
const showStatusObjDialog = computed(() => (statusObj.value && statusObj.value.show) ?? false);
const statusObj = ref<null | {
  uid: string | number;
  value: string;
  old_value: string;
  show: boolean;
  title: string;
  password: string;
}>(null);
const statusObjFormRef = ref<FormInstance>();
const statusObjRules: FormRules = reactive({
  password: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("GAME_SERVER_STATUS_PASSWORD") }),
      trigger: "blur",
    },
  ],
});

const freeze = computed({
  get: () => statusObj?.value?.value == appConfig.value.MAX_DATE_TIME,
  set: (newVal) => {
    if (newVal) {
      statusObj.value!.value = appConfig.value.MAX_DATE_TIME;
    } else {
      statusObj.value!.value = statusObj.value!.old_value;
    }
  },
});

const route = useRoute();
const bindingEvent = () => {
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .master_split`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .master_split`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        if (!permissionStore.userPermissions.includes("host_split")) {
          return;
        }
        const element = this as HTMLDivElement;
        const clientId = $(element).data("client");
        masterSplit.value = {
          uid: $(element).data("id"),
          value: parseFloat($(element).data("value")),
          show: true,
          title: `${t("PLAYER_MEMBER_MANAGEMENT_MASTER_SPLIT")}(${clientId})`,
          password: "",
        };
      }
    );
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .kick_player_out`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .kick_player_out`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        const element = this as HTMLDivElement;
        const clientId = $(element).data("client");
        kickPlayOut.value = {
          uid: $(element).data("id"),
          show: true,
          title: `${t("PLAYER_MEMBER_MANAGEMENT_KICK_PLAYER_OUT")}(${clientId})`,
          password: "",
        };
      }
    );
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .add_gold`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .add_gold`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        const element = this as HTMLDivElement;
        const clientId = $(element).data("client");
        playerAddGold.value = {
          uid: $(element).data("id"),
          old_gold: parseFloat($(element).data("value")),
          new_gold: parseFloat($(element).data("value")),
          value: 0,
          show: true,
          title: `${t("PLAYER_MEMBER_MANAGEMENT_ADD_GOLD")}(${clientId})`,
          password: "",
        };
      }
    );
  $("body")
    .off("click", `#tab_${route.query.tabId || route.meta.id}_wrapper .status`)
    .on(
      "click",
      `#tab_${route.query.tabId || route.meta.id}_wrapper .status`,
      // eslint-disable-next-line no-unused-vars
      function (this: HTMLElement) {
        if (!permissionStore.userPermissions.includes("account_freeze")) {
          return;
        }
        const element = this as HTMLDivElement;
        const clientId = $(element).data("client");
        statusObj.value = {
          uid: $(element).data("id"),
          value: $(element).data("value"),
          old_value: $(element).data("value"),
          show: true,
          title: `${t("PLAYER_MEMBER_MANAGEMENT_STATUS")}(${clientId})`,
          password: "",
        };
      }
    );
};

onMounted(() => {
  handleQuery();
  bindingEvent();
});

onActivated(() => {
  bindingEvent();
});
</script>
