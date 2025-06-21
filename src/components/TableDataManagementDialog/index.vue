<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? $t('EDIT_TABLE') : $t('CREATE_TABLE')"
    width="700px"
    @closed="resetForm"
  >
    <el-form
      :model="formData"
      :rules="rules"
      ref="formRef"
      label-position="top"
      label-width="100px"
    >
      <!-- 上半部可編輯 -->
      <!-- 遊戲玩法 -->
      <el-form-item :label="$t('TABLE_LIST_SERVER_NAME')" prop="server_id">
        <el-select
          v-model="formData.server_id"
          placeholder="$t('TABLE_LIST_AGENT_ACCOUNT_MANAGEMENT')"
          class="w-full"
          @change="handleGameTypeChange"
          :disabled="props.isEdit"
        >
          <el-option
            v-for="item in gameTypeModes"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 牌桌規則 -->
      <el-form-item :label="$t('TABLE_LIST_TABLE_RULE_NAME')" prop="rule_id">
        <el-select
          v-model="formData.rule_id"
          placeholder="$t('TABLE_LIST_AGENT_ACCOUNT_MANAGEMENT')"
          class="w-full"
          @change="handleRuleChange"
        >
          <el-option
            v-for="item in tableRuleOptions"
            :key="item.id"
            :label="item.rule_name"
            :value="item.rule_id"
          />
        </el-select>
      </el-form-item>

      <div class="flex gap-4">
        <!-- 公海開關 -->
        <el-form-item :label="$t('TABLE_LIST_SEA_FL')" prop="sea_fl" class="flex-1">
          <el-switch
            v-model="formData.sea_fl"
            :active-value="true"
            :inactive-value="false"
            :disabled="props.isEdit"
          />
        </el-form-item>

        <!-- 代理選單（僅私海顯示） -->
        <el-form-item
          v-if="!formData.sea_fl"
          :label="$t('TABLE_LIST_AGENT_NAME')"
          prop="agent_id"
          class="flex-1"
        >
          <el-select
            v-model="formData.agent_id"
            placeholder="$t('TABLE_LIST_AGENT_ACCOUNT_MANAGEMENT')"
            class="w-full"
            :disabled="props.isEdit"
          >
            <el-option
              v-for="item in agentOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 牌桌數量 -->
      <el-form-item v-if="!props.isEdit" prop="table_open_number">
        <template #label>
          <span>
            {{ $t("TABLE_LIST_TABLE_COUNT") }}
            <el-tooltip effect="dark" :content="t('TABLE_LIST_TABLE_COUNT_HINT')" placement="top">
              <el-icon class="ml-1 text-sm align-middle"><QuestionFilled /></el-icon>
            </el-tooltip>
          </span>
        </template>
        <el-input
          v-model="formData.table_open_number"
          :min="1"
          @input="(val) => (formData.table_open_number = Number(val))"
        />
      </el-form-item>

      <!-- 下半部只讀欄位 -->
      <el-divider />
      <h4 class="text-center text-lg font-bold my-2">{{ $t("TABLE_LIST_TABLE_RULE_NAME") }}</h4>

      <!-- 遊戲玩法 -->
      <el-form-item :label="$t('TABLE_RULE_SERVER_NAME')">
        <el-select v-model="formData.server_id" class="w-full" disabled>
          <el-option
            v-for="item in gameTypeModes"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 規則名稱 -->
      <el-form-item :label="$t('TABLE_RULE_RULE_NAME')">
        <el-select v-model="formData.rule_id" class="w-full" disabled>
          <el-option
            v-for="item in tableRuleOptions"
            :key="item.rule_id"
            :label="item.rule_name"
            :value="item.rule_id"
          />
        </el-select>
      </el-form-item>

      <!-- 上半部 input 區域 -->
      <div class="flex flex-wrap -mx-2">
        <!-- 左欄 -->
        <div class="w-full md:w-1/2 px-2">
          <!-- 最少玩家 -->
          <el-form-item :label="$t('TABLE_RULE_MIN_PLAYER')">
            <el-input v-model="formData.min_player" disabled />
          </el-form-item>

          <!-- 等待購買EV保險時間 -->
          <el-form-item :label="$t('TABLE_RULE_WAIT_BUY_EV_SEC')">
            <el-input v-model="formData.wait_buy_ev_sec" disabled />
          </el-form-item>

          <!-- 抽水封頂 -->
          <el-form-item :label="$t('TABLE_RULE_MAX_RAKE_GOLD')">
            <el-input v-model="formData.max_rake_gold" disabled />
          </el-form-item>

          <!-- 最小買入金額 -->
          <el-form-item :label="$t('TABLE_RULE_MIN_BUY_GOLD')">
            <el-input v-model="formData.min_buy_gold" disabled />
          </el-form-item>

          <!-- 時間銀行秒數 -->
          <el-form-item :label="$t('TABLE_RULE_TIME_BANK_SEC')">
            <el-input v-model="formData.time_bank_sec" disabled />
          </el-form-item>

          <!-- 小盲 -->
          <el-form-item
            v-if="formData.server_id !== 2 && formData.server_id !== 12"
            :label="$t('TABLE_RULE_SB_GOLD')"
          >
            <el-input v-model="formData.sb_gold" disabled />
          </el-form-item>

          <!-- 下注時間 -->
          <el-form-item :label="$t('TABLE_RULE_BETTING_TIME')">
            <el-input v-model="formData.wait_bet_sec" disabled />
          </el-form-item>

          <!-- 前注（只在玩法2/12） -->
          <el-form-item
            v-if="formData.server_id === 2 || formData.server_id === 12"
            :label="$t('TABLE_RULE_ANTE_GOLD')"
          >
            <el-input v-model="formData.ante_gold" disabled />
          </el-form-item>
        </div>

        <!-- 右欄 -->
        <div class="w-full md:w-1/2 px-2">
          <!-- 最多玩家 -->
          <el-form-item :label="$t('TABLE_RULE_MAX_PLAYER')">
            <el-input v-model="formData.max_player" disabled />
          </el-form-item>

          <!-- 抽水比例 -->
          <el-form-item prop="rake">
            <template #label>
              <span class="flex items-center space-x-1">
                <span>{{ $t("TABLE_RULE_RAKE") }}</span>
                <template v-if="formData.agent_id">
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    :content="$t('TABLE_LIST_TABLE_COUNT_RAKE')"
                  >
                    <el-icon class="ml-1 text-sm align-middle text-[#f56c6c]">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </template>
              </span>
            </template>
            <div class="flex items-center space-x-1 w-full">
              <el-input v-model="formData.rake" disabled class="w-full" />
              <span>%</span>
            </div>
          </el-form-item>

          <!-- 抽水封頂(4人) -->
          <el-form-item :label="$t('TABLE_RULE_MAX_RAKE_GOLD4')">
            <el-input v-model="formData.max_rake_gold4" disabled />
          </el-form-item>

          <!-- 最大買入金額 -->
          <el-form-item :label="$t('TABLE_RULE_MAX_BUY_GOLD')">
            <el-input v-model="formData.max_buy_gold" disabled />
          </el-form-item>

          <!-- 時間銀行購買鑽石數量 -->
          <el-form-item :label="$t('TABLE_RULE_TIME_BANK_DIAMOND')">
            <el-input v-model="formData.time_bank_diamond" disabled />
          </el-form-item>

          <!-- 大盲 -->
          <el-form-item
            v-if="formData.server_id !== 2 && formData.server_id !== 12"
            :label="$t('TABLE_RULE_BB_GOLD')"
          >
            <el-input v-model="formData.bb_gold" disabled />
          </el-form-item>

          <!-- 留座時間 -->
          <el-form-item :label="$t('TABLE_RULE_RESERVATION_TIME')">
            <el-input v-model="formData.winner_need_play_sec" disabled />
          </el-form-item>
        </div>
      </div>

      <!-- 下半部 switch（開關）區域 -->
      <div class="flex flex-wrap -mx-2 mt-4">
        <!-- 左欄 -->
        <div class="w-full md:w-1/2 px-2">
          <!-- EV保險 -->
          <el-form-item :label="$t('TABLE_LIST_EV_FL')">
            <el-switch v-model="formData.ev_fl" disabled />
          </el-form-item>
          <!-- IP檢查 -->
          <el-form-item :label="$t('TABLE_RULE_IP_CHECK')">
            <el-switch v-model="formData.ip_check_fl" disabled />
          </el-form-item>
          <!-- 分牌 -->
          <el-form-item :label="$t('TABLE_RULE_MULTI_DEALT_FL')">
            <el-switch v-model="formData.multi_dealt_fl" disabled />
          </el-form-item>
          <!-- 盲抓 -->
          <el-form-item :label="$t('TABLE_RULE_BLIND_CATCH')">
            <el-switch v-model="formData.straddle_fl" disabled />
          </el-form-item>
          <!-- 時間銀行 -->
          <el-form-item :label="$t('TABLE_RULE_TIME_BANK')">
            <el-switch v-model="formData.time_bank_fl" disabled />
          </el-form-item>
          <!-- 亮牌 -->
          <el-form-item :label="$t('TABLE_RULE_SHOW_CARDS')">
            <el-switch v-model="formData.self_flop_fl" disabled />
          </el-form-item>
          <!-- 允許玩家購買金幣 -->
          <el-form-item :label="$t('TABLE_RULE_AUTO_BUY')">
            <el-switch v-model="formData.auto_buy_fl" disabled />
          </el-form-item>
          <!-- 啟用測試 -->
          <el-form-item :label="$t('TABLE_RULE_ENABLE_TEST')">
            <el-switch v-model="formData.test_fl" disabled />
          </el-form-item>
        </div>

        <!-- 右欄 -->
        <div class="w-full md:w-1/2 px-2">
          <!-- 抽水上限 -->
          <el-form-item :label="$t('TABLE_RULE_RAKE_CAP')">
            <el-switch v-model="formData.rake_limit_fl" disabled />
          </el-form-item>
          <!-- 咪牌 -->
          <el-form-item :label="$t('TABLE_RULE_PEEK_CARDS')">
            <el-switch v-model="formData.mi_card_fl" disabled />
          </el-form-item>
          <!-- 獵兔 -->
          <el-form-item :label="$t('TABLE_RULE_RABBIT_HUNTING')">
            <el-switch v-model="formData.rabbiting_fl" disabled />
          </el-form-item>
          <!-- 勝負率提示 -->
          <el-form-item :label="$t('TABLE_RULE_WIN_RATE_INDICATOR')">
            <el-switch v-model="formData.win_rate_fl" disabled />
          </el-form-item>
          <!-- 道具&表情 -->
          <el-form-item :label="$t('TABLE_RULE_ITEMS_AND_EMOJIS')">
            <el-switch v-model="formData.emoji_fl" disabled />
          </el-form-item>
          <!-- 聊天 -->
          <el-form-item :label="$t('TABLE_RULE_CHAT')">
            <el-switch v-model="formData.chat_fl" disabled />
          </el-form-item>
          <!-- 允許玩家加入 -->
          <el-form-item :label="$t('TABLE_RULE_AUTO_JOIN')">
            <el-switch v-model="formData.auto_join_fl" disabled />
          </el-form-item>
          <!-- 接受尼瑪 -->
          <el-form-item :label="$t('TABLE_RULE_TOKEN')">
            <el-switch v-model="formData.dead_chip_fl" disabled />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ $t("BUTTON_CANCEL") }}</el-button>
      <el-button type="primary" @click="submitForm">{{ $t("BUTTON_CONFIRM") }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessageBox, FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import {
  getTableRuleOptions,
  getTableRuleRecord,
  TableListVO,
  createTable,
  updateTable,
  getAgentOptions,
  type TableListForm,
  type TableListEnumVO,
  type TableRuleOption,
  type AgentOptions,
} from "@/api/table_data_management.api";

interface Props {
  visible: boolean;
  isEdit: boolean;
  editId: number | null;
  editData: TableListVO | null;
  gameTypeModes: TableListEnumVO[];
}

const props = defineProps<Props>();
const emit = defineEmits(["update:visible", "refresh"]);

const { t } = useI18n();

const visible = ref(false);
const formRef = ref<FormInstance>();
const tableRuleOptions = ref<TableRuleOption[]>([]);
const agentOptions = ref<AgentOptions[]>([]);

const gameTypeModes = computed(() => props.gameTypeModes);

// 初始化 formData
const formData = ref<TableListForm>({
  id: 1,
  server_id: 0,
  rule_id: 0,
  sea_fl: true,
  agent_id: 0,
  table_open_number: 1,

  // 數值欄位
  min_player: 2,
  max_player: 6,
  ante_gold: 0,
  sb_gold: 0,
  bb_gold: 0,
  min_buy_gold: 0,
  max_buy_gold: 0,
  rake: 0,
  max_rake_gold: 0,
  max_rake_gold4: 0,
  time_bank_sec: 0,
  time_bank_diamond: 0,
  wait_bet_sec: 0,
  wait_buy_ev_sec: 0,
  winner_need_play_sec: 0,

  // 開關欄位 (Boolean)
  ev_fl: false,
  rake_limit_fl: false,
  ip_check_fl: false,
  mi_card_fl: false,
  multi_dealt_fl: false,
  rabbiting_fl: false,
  straddle_fl: false,
  win_rate_fl: false,
  time_bank_fl: false,
  emoji_fl: false,
  self_flop_fl: false,
  chat_fl: false,
  dead_chip_fl: false,
  auto_buy_fl: false,
  auto_join_fl: false,
  test_fl: false,
});

// 表單驗證規則
const rules = reactive<{ [key: string]: any[] }>({
  server_id: [
    {
      required: true,
      message: `${t("TABLE_LIST_AGENT_ACCOUNT_MANAGEMENT")} ${t("TABLE_LIST_SERVER_NAME")}`,
    },
  ],
  rule_id: [
    {
      required: true,
      message: `${t("TABLE_LIST_AGENT_ACCOUNT_MANAGEMENT")} ${t("TABLE_LIST_TABLE_RULE_NAME")}`,
    },
  ],
  table_open_number: [
    {
      required: true,
      type: "number",
      min: 1,
      message: t("TABLE_LIST_TABLE_NUMBER"),
    },
  ],
});

// 1. 定義一個暫時的旗標
let isInit = false;

// 表單初始化（從 props 設定 visible 狀態）
watch(
  () => props.visible,
  async (val) => {
    visible.value = val;
    if (val) {
      resetForm();

      isInit = true; // 設定初始化旗標

      if (props.isEdit && props.editData) {
        // 1. 先帶入所有欄位（包含 sea_fl, agent_id 等）
        Object.assign(formData.value, props.editData);

        // 2. 載入規則選單（會設定 server_id/rule_id 等）
        await handleGameTypeChange(props.editData.server_id, props.editData.rule_id);

        // 3. 根據 sea_fl 決定要不要載入代理
        if (props.editData.sea_fl === false) {
          // 3-1. 載入代理選單
          const { result, data } = await getAgentOptions(formData.value.sea_fl);
          if (result) {
            agentOptions.value = data.map((item: AgentOptions) => ({
              id: item.id,
              name: `${item.ga_name} (${item.ga_company_name})`,
              rake: item.rake,
            }));

            // 3-2. 代理選單載入後才設定 agent_id
            formData.value.agent_id = props.editData.agent_id;
          }
        } else {
          // 3-3. 公海就清空代理選單
          agentOptions.value = [];
          formData.value.agent_id = 0;
        }
      } else {
        // 新增模式
        const defaultGameId = props.gameTypeModes?.[0]?.id;
        if (defaultGameId) {
          formData.value.server_id = defaultGameId;
          await handleGameTypeChange(defaultGameId);
        }
      }
      isInit = false;
    }
  }
);

watch(visible, (val) => emit("update:visible", val));

const ruleRake = ref<number>(0); // 用來記住從牌桌規則取得的 rake

//當加入公海為關閉呼叫代理選單
watch(
  () => formData.value.sea_fl,
  async (val) => {
    if (isInit) return; // 初始化期間不做
    if (val === false) {
      const { result, data } = await getAgentOptions(formData.value.sea_fl);
      if (result) {
        agentOptions.value = data.map((item: AgentOptions) => ({
          id: item.id,
          name: `${item.ga_name} (${item.ga_company_name})`,
          rake: item.rake,
        }));

        // 若已有選取代理則帶入對應 rake
        const selectedAgent = agentOptions.value.find((a) => a.id === formData.value.agent_id);
        if (selectedAgent && typeof selectedAgent.rake === "number") {
          formData.value.rake = selectedAgent.rake;
        }

        // ✅ 預選第一個代理（如有）
        if (agentOptions.value.length > 0) {
          const firstAgent = agentOptions.value[0];
          formData.value.agent_id = firstAgent.id;
          console.log("代理ID" + firstAgent.id);
        }
      }
    } else {
      // ✅ sea_fl 為 true → 恢復原始規則 rake
      formData.value.agent_id = 0;
      agentOptions.value = [];
      formData.value.rake = ruleRake.value;
    }
  }
);

//當選擇代理時 將代理rake帶入
watch(
  () => formData.value.agent_id,
  (val) => {
    if (val && formData.value.sea_fl === false) {
      const selectedAgent = agentOptions.value.find((agent) => agent.id === val);
      if (selectedAgent && typeof selectedAgent.rake === "number") {
        formData.value.rake = selectedAgent.rake;
        console.log("代理" + formData.value.agent_id);
      }
    }
  }
);

// 遊戲類別變更 → 載入對應規則並預選第一項
// 新增 forceRuleId 參數，只有在編輯模式時才會帶入
const handleGameTypeChange = async (id: number, forceRuleId?: number) => {
  formData.value.server_id = id;
  tableRuleOptions.value = [];

  const { result, data } = await getTableRuleOptions(id);
  if (result && data.length > 0) {
    tableRuleOptions.value = data;

    let targetRuleId: number;
    if (forceRuleId) {
      // 編輯時，強制指定 rule_id
      targetRuleId = forceRuleId;
    } else {
      // 新增時，用第一筆
      targetRuleId = data[0].rule_id;
    }

    formData.value.rule_id = targetRuleId;
    await handleRuleChange(targetRuleId);
  }
};

// 規則變更 → 載入規則內容
const handleRuleChange = async (ruleId: number) => {
  // 先找出對應 option
  const selectedOption = tableRuleOptions.value.find((item) => item.rule_id === ruleId);
  if (!selectedOption) return;
  console.log("selected:" + selectedOption.id);

  // 取得詳細內容要用 option.id
  const { result, data } = await getTableRuleRecord(selectedOption.id);
  if (result && data.length > 0) {
    const rule = data[0];

    ruleRake.value = rule.rake;
    // 覆蓋所有展示區欄位（不要動 rule_id）
    formData.value.min_player = rule.min_player;
    formData.value.max_player = rule.max_player;
    formData.value.ante_gold = rule.ante_gold;
    formData.value.sb_gold = rule.sb_gold;
    formData.value.bb_gold = rule.bb_gold;
    formData.value.min_buy_gold = rule.min_buy_gold;
    formData.value.max_buy_gold = rule.max_buy_gold;
    if (formData.value.sea_fl) {
      formData.value.rake = rule.rake;
    }
    formData.value.max_rake_gold = rule.max_rake_gold;
    formData.value.max_rake_gold4 = rule.max_rake_gold4;
    formData.value.time_bank_sec = rule.time_bank_sec;
    formData.value.time_bank_diamond = rule.time_bank_diamond;
    formData.value.wait_bet_sec = rule.wait_bet_sec;
    formData.value.wait_buy_ev_sec = rule.wait_buy_ev_sec;
    formData.value.winner_need_play_sec = rule.winner_need_play_sec;

    // boolean 欄位
    formData.value.ev_fl = rule.ev_fl;
    formData.value.rake_limit_fl = rule.rake_limit_fl;
    formData.value.ip_check_fl = rule.ip_check_fl;
    formData.value.mi_card_fl = rule.mi_card_fl;
    formData.value.multi_dealt_fl = rule.multi_dealt_fl;
    formData.value.rabbiting_fl = rule.rabbiting_fl;
    formData.value.straddle_fl = rule.straddle_fl;
    formData.value.win_rate_fl = rule.win_rate_fl;
    formData.value.time_bank_fl = rule.time_bank_fl;
    formData.value.emoji_fl = rule.emoji_fl;
    formData.value.self_flop_fl = rule.self_flop_fl;
    formData.value.chat_fl = rule.chat_fl;
    formData.value.dead_chip_fl = rule.dead_chip_fl;
    formData.value.auto_buy_fl = rule.auto_buy_fl;
    formData.value.auto_join_fl = rule.auto_join_fl;
    formData.value.test_fl = rule.test_fl;
  }
};

// 提交表單
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();

  const api = props.isEdit ? updateTable : createTable;

  let payload: any;

  if (props.isEdit) {
    // ✅ 編輯模式只送 id + rule_id
    console.log(formData);
    payload = {
      id: formData.value.id,
      rule_id: formData.value.rule_id,
    };
  } else {
    // ✅ 建立模式送出所有欄位
    payload = {
      server_id: formData.value.server_id,
      agent_id: formData.value.sea_fl ? null : formData.value.agent_id,
      rule_id: formData.value.rule_id,
      table_open_number: formData.value.table_open_number,
    };
  }

  const { result, msg } = await api(payload);

  if (!result) {
    return ElMessageBox.alert(msg, t("MSG_ACTION_FAIL_MESSAGE"), {
      type: "error",
      confirmButtonText: t("BUTTON_CONFIRM"),
    });
  }

  await ElMessageBox.alert(msg, t("MSG_ACTION_SUCCESS_MESSAGE"), {
    type: "success",
    confirmButtonText: t("BUTTON_CONFIRM"),
  });

  visible.value = false;
  emit("refresh");
};

// 重設表單
const resetForm = () => {
  tableRuleOptions.value = [];
  formData.value = {
    id: 0,
    server_id: 0,
    rule_id: 0,
    sea_fl: true,
    agent_id: 0,
    table_open_number: 1,

    // 數值欄位
    min_player: 2,
    max_player: 6,
    ante_gold: 0,
    sb_gold: 0,
    bb_gold: 0,
    min_buy_gold: 0,
    max_buy_gold: 0,
    rake: 0,
    max_rake_gold: 0,
    max_rake_gold4: 0,
    time_bank_sec: 0,
    time_bank_diamond: 0,
    wait_bet_sec: 0,
    wait_buy_ev_sec: 0,
    winner_need_play_sec: 0,

    // 開關欄位 (Boolean)
    ev_fl: false,
    rake_limit_fl: false,
    ip_check_fl: false,
    mi_card_fl: false,
    multi_dealt_fl: false,
    rabbiting_fl: false,
    straddle_fl: false,
    win_rate_fl: false,
    time_bank_fl: false,
    emoji_fl: false,
    self_flop_fl: false,
    chat_fl: false,
    dead_chip_fl: false,
    auto_buy_fl: false,
    auto_join_fl: false,
    test_fl: false,
  };
};
</script>
