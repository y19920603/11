<template>
  <el-dialog
    v-model="props.visible"
    :title="title"
    class="w-[90vw]! md:w-[600px]! table-rule-dialog max-h-[75vh] overflow-y-auto"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top">
      <el-form-item v-if="isEdit" :label="$t('TABLE_RULE_TABLE_RULE_NAME')" prop="rule_name">
        <el-input v-model="formData.rule_name" @blur="clearError('rule_name')" />
      </el-form-item>
      <el-form-item :label="$t('TABLE_RULE_SERVER_NAME')" prop="server_id">
        <el-select
          v-model="formData.server_id"
          :placeholder="$t('GAME_SERVER_STATUS_SERVER_NAME')"
          :clearable="false"
          :disabled="isEdit"
          class="w-full centered-select"
        >
          <el-option
            v-for="item in gameModes"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            class="text-center"
          />
        </el-select>
      </el-form-item>
      <div class="flex flex-wrap -mx-2">
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="min_player" :label="$t('TABLE_RULE_MIN_PLAYER')">
            <el-select v-model="formData.min_player" class="w-full" disabled>
              <el-option :value="2" label="2人">2人</el-option>
            </el-select>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item :label="$t('TABLE_RULE_MAX_PLAYER')">
            <el-select v-model="formData.max_player" class="w-full">
              <template v-if="[4, 5, 14, 15].includes(formData.server_id as number)">
                <el-option :value="4" label="4人" />
              </template>
              <template v-else>
                <el-option :value="6" label="6人" />
                <el-option :value="9" label="9人" />
              </template>
            </el-select>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="wait_buy_ev_sec" :label="$t('TABLE_RULE_WAIT_BUY_EV_SEC')">
            <el-input
              v-model="formData.wait_buy_ev_sec"
              type="number"
              step="1"
              @blur="clearError('wait_buy_ev_sec')"
            />
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="rake" :label="$t('TABLE_RULE_RAKE')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.rake"
                type="number"
                step="0.1"
                @blur="clearError('rake')"
              />
              <span class="text-base">%</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="max_rake_gold" :label="$t('TABLE_RULE_MAX_RAKE_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.max_rake_gold"
                type="number"
                @blur="clearError('max_rake_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="max_rake_gold4" :label="$t('TABLE_RULE_MAX_RAKE_GOLD4')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.max_rake_gold4"
                type="number"
                @blur="clearError('max_rake_gold4')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="min_buy_gold" :label="$t('TABLE_RULE_MIN_BUY_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.min_buy_gold"
                type="number"
                step="1"
                @blur="clearError('min_buy_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="max_buy_gold" :label="$t('TABLE_RULE_MAX_BUY_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.max_buy_gold"
                type="number"
                step="1"
                @blur="clearError('max_buy_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="time_bank_sec" :label="$t('TABLE_RULE_TIME_BANK_SEC')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.time_bank_sec"
                type="number"
                step="1"
                @blur="clearError('time_bank_sec')"
              />
              <span class="text-base">秒</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="time_bank_diamond" :label="$t('TABLE_RULE_TIME_BANK_DIAMOND')">
            <el-input
              v-model="formData.time_bank_diamond"
              type="number"
              step="1"
              @blur="clearError('time_bank_diamond')"
            />
          </el-form-item>
        </div>
        <div
          v-if="![1, 3, 4, 5, 11, 13, 14, 15].includes(formData.server_id as number)"
          class="w-full sm:w-1/2 px-2"
        >
          <el-form-item prop="ante_gold" :label="$t('TABLE_RULE_ANTE_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.ante_gold"
                type="number"
                step="1"
                @blur="clearError('ante_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div v-if="![2, 12].includes(formData.server_id as number)" class="w-full sm:w-1/2 px-2">
          <el-form-item prop="sb_gold" :label="$t('TABLE_RULE_SB_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.sb_gold"
                type="number"
                step="1"
                @blur="clearError('sb_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div v-if="![2, 12].includes(formData.server_id as number)" class="w-full sm:w-1/2 px-2">
          <el-form-item prop="bb_gold" :label="$t('TABLE_RULE_BB_GOLD')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.bb_gold"
                type="number"
                step="1"
                @blur="clearError('bb_gold')"
              />
              <span class="text-base">$</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="wait_bet_sec" :label="$t('TABLE_RULE_BETTING_TIME')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.wait_bet_sec"
                type="number"
                step="1"
                @blur="clearError('wait_bet_sec')"
              />
              <span class="text-base">秒</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item prop="winner_need_play_sec" :label="$t('TABLE_RULE_RESERVATION_TIME')">
            <div class="flex items-center space-x-1 w-full">
              <el-input
                v-model="formData.winner_need_play_sec"
                type="number"
                step="1"
                @blur="clearError('winner_need_play_sec')"
              />
              <span class="text-base">秒</span>
            </div>
          </el-form-item>
        </div>
        <div class="w-full sm:w-1/2 px-2">
          <el-form-item :label="$t('TABLE_RULE_RULE_LV')" prop="rule_lv">
            <el-select
              v-model="formData.rule_lv"
              :placeholder="$t('TABLE_RULE_RULE_LV')"
              :clearable="false"
              class="w-full"
            >
              <el-option
                v-for="item in ruleLevels"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
      </div>
      <div class="flex flex-wrap -mx-2">
        <div v-show="showDeadChip" class="w-1/2 px-2">
          <el-form-item prop="dead_chip_fl" :label="$t('TABLE_RULE_TOKEN')">
            <el-switch
              v-model="formData.dead_chip_fl!"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="ev_fl" :label="$t('TABLE_RULE_OPEN_EV_CASHBACK_TIME')">
            <el-switch
              v-model="formData.ev_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="rake_limit_fl" :label="$t('TABLE_RULE_RAKE_CAP')">
            <el-switch
              v-model="formData.rake_limit_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="ip_check_fl" :label="$t('TABLE_RULE_IP_CHECK')">
            <el-switch
              v-model="formData.ip_check_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="mi_card_fl" :label="$t('TABLE_RULE_PEEK_CARDS')">
            <el-switch
              v-model="formData.mi_card_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="multi_dealt_fl" :label="$t('TABLE_RULE_MULTI_DEALT_FL')">
            <el-switch
              v-model="formData.multi_dealt_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="rabbiting_fl" :label="$t('TABLE_RULE_RABBIT_HUNTING')">
            <el-switch
              v-model="formData.rabbiting_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="straddle_fl" :label="$t('TABLE_RULE_BLIND_CATCH')">
            <el-switch
              v-model="formData.straddle_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="win_rate_fl" :label="$t('TABLE_RULE_WIN_RATE_INDICATOR')">
            <el-switch
              v-model="formData.win_rate_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="time_bank_fl" :label="$t('TABLE_RULE_TIME_BANK')">
            <el-switch
              v-model="formData.time_bank_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="emoji_fl" :label="$t('TABLE_RULE_ITEMS_AND_EMOJIS')">
            <el-switch
              v-model="formData.emoji_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="self_flop_fl" :label="$t('TABLE_RULE_SHOW_CARDS')">
            <el-switch
              v-model="formData.self_flop_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="chat_fl" :label="$t('TABLE_RULE_CHAT')">
            <el-switch
              v-model="formData.chat_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="auto_buy_fl" :label="$t('TABLE_RULE_AUTO_BUY')">
            <el-switch
              v-model="formData.auto_buy_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="auto_join_fl" :label="$t('TABLE_RULE_AUTO_JOIN')">
            <el-switch
              v-model="formData.auto_join_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
        <div class="w-1/2 px-2">
          <el-form-item prop="test_fl" :label="$t('TABLE_RULE_ENABLE_TEST')">
            <el-switch
              v-model="formData.test_fl"
              size="large"
              width="80"
              inline-prompt
              :active-text="$t('SWITCH_OPEN')"
              :inactive-text="$t('SWITCH_CLOSE')"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer flex justify-center space-x-10">
        <el-button class="px-10" type="danger" @click="handleSubmit">
          {{ isEdit ? $t("BUTTON_UPDATE") : $t("BUTTON_CREATE") }}
        </el-button>
        <el-button class="px-10" type="primary" @click="resetForm">
          {{ $t("BUTTON_RESET") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import TableRuleAPI, { UpdateTableRuleParam } from "@/api/table_rule.api";
import { clearFieldError, updateValidationRules, clearAllCustomValidators } from "@/utils/field";
import { FormInstance } from "element-plus";
import { useLoadingStore } from "@/store";
import { EnumVO } from "@/api/enum.api";

const props = defineProps<{
  visible: boolean;
  title: string;
  formData: UpdateTableRuleParam;
  isEdit: boolean;
  gameModes: EnumVO[];
  ruleLevels: EnumVO[];
}>();

const emit = defineEmits(["resetForm", "handleCloseDialog"]);

const { setLoading } = useLoadingStore();
const { t } = useI18n();

const formRef = ref<FormInstance>();
const isSubmit = ref(false);
const ruleType = computed(() =>
  [1, 2, 3, 4, 5].includes(props.formData.server_id as number) ? 1 : 0
);
const showDeadChip = computed(() => ruleType.value === 1);

const handleClose = () => {
  emit("handleCloseDialog");
};

const clearError = (field: string) => {
  if (isSubmit.value) {
    clearFieldError(formRef.value, rules, field);
  }
};

watch(showDeadChip, (bool) => (props.formData.dead_chip_fl = bool ? true : null));

const resetForm = () => {
  clearAllCustomValidators(rules);

  isSubmit.value = false;
  nextTick(() => {
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.clearValidate();
      }
    }, 0);
  });
  emit("resetForm");
};

const rules = reactive({
  server_id: [
    {
      required: true,
    },
  ],
  min_player: [
    {
      required: true,
    },
  ],
  max_player: [
    {
      required: true,
    },
  ],
  wait_buy_ev_sec: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_WAIT_BUY_EV_SEC") }),
      trigger: "blur",
    },
  ],
  rake: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_RAKE") }),
      trigger: "blur",
    },
  ],
  max_rake_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_MAX_RAKE_GOLD") }),
      trigger: "blur",
    },
  ],
  max_rake_gold4: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_MAX_RAKE_GOLD4") }),
      trigger: "blur",
    },
  ],
  min_buy_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_MIN_BUY_GOLD") }),
      trigger: "blur",
    },
  ],
  max_buy_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_MAX_BUY_GOLD") }),
      trigger: "blur",
    },
  ],
  time_bank_sec: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_TIME_BANK_SEC") }),
      trigger: "blur",
    },
  ],
  time_bank_diamond: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_TIME_BANK_DIAMOND") }),
      trigger: "blur",
    },
  ],
  sb_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_SB_GOLD") }),
      trigger: "blur",
    },
  ],
  bb_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_BB_GOLD") }),
      trigger: "blur",
    },
  ],
  ante_gold: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_ANTE_GOLD") }),
      trigger: "blur",
    },
  ],
  wait_bet_sec: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_BETTING_TIME") }),
      trigger: "blur",
    },
  ],
  winner_need_play_sec: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_RESERVATION_TIME") }),
      trigger: "blur",
    },
  ],
  rule_name: [
    {
      required: true,
      message: t("MSG_NOT_EMPTY", { key: t("TABLE_RULE_TABLE_RULE_NAME") }),
      trigger: "blur",
    },
  ],
  rule_lv: [
    {
      required: true,
    },
  ],
  dead_chip_fl: [
    {
      required: true,
    },
  ],
  ev_fl: [
    {
      required: true,
    },
  ],
  rake_limit_fl: [
    {
      required: true,
    },
  ],
  ip_check_fl: [
    {
      required: true,
    },
  ],
  multi_dealt_fl: [
    {
      required: true,
    },
  ],
  mi_card_fl: [
    {
      required: true,
    },
  ],
  rabbiting_fl: [
    {
      required: true,
    },
  ],
  straddle_fl: [
    {
      required: true,
    },
  ],
  win_rate_fl: [
    {
      required: true,
    },
  ],
  time_bank_fl: [
    {
      required: true,
    },
  ],
  emoji_fl: [
    {
      required: true,
    },
  ],
  self_flop_fl: [
    {
      required: true,
    },
  ],
  chat_fl: [
    {
      required: true,
    },
  ],
  auto_buy_fl: [
    {
      required: true,
    },
  ],
  auto_join_fl: [
    {
      required: true,
    },
  ],
  test_fl: [
    {
      required: true,
    },
  ],
});

async function handleSubmit() {
  if (!showDeadChip.value) {
    rules.dead_chip_fl = []; // 送出前不驗證
  } else {
    rules.dead_chip_fl = [{ required: true }];
  }
  
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    setLoading(true);

    const isUpdate = Boolean(props.formData.id);
    const action = t(isUpdate ? "BUTTON_UPDATE" : "BUTTON_CREATE");

    try {
      const api = isUpdate ? TableRuleAPI.update : TableRuleAPI.create;

      const dataToSubmit = { ...props.formData };

      if ([1, 3, 4, 5, 11, 13, 14, 15].includes(dataToSubmit.server_id as number)) {
        dataToSubmit.ante_gold = null;
      }

      if ([2, 12].includes(dataToSubmit.server_id as number)) {
        dataToSubmit.sb_gold = null;
        dataToSubmit.bb_gold = null;
      }

      if (!isUpdate) {
        delete (dataToSubmit as any).id;
        delete (dataToSubmit as any).rule_name;
      }

      const { result, msg, errors } = await api(dataToSubmit);

      if (!result) {
        if (errors && typeof errors === "object") {
          isSubmit.value = true;
          updateValidationRules(formRef.value, rules, errors);
        }
      } else {
        const message =
          t(result ? "MSG_ACTION_SUCCESS_MESSAGE" : "MSG_ACTION_FAIL_MESSAGE", { action }) +
          (result ? "" : ` message: ${msg}`);

        await ElMessageBox.alert(message, {
          confirmButtonText: t("BUTTON_CONFIRM"),
        });
      }

      if (!result) {
        return;
      }

      emit("handleCloseDialog", true);
    } catch (error) {
      if (error === "cancel" || error === "close") return;
      const errorMessage = error instanceof Error ? error.message : String(error);

      ElMessageBox.alert(errorMessage, {
        type: "error",
        confirmButtonText: t("BUTTON_CLOSE"),
      });
      
      console.error("Submit error:", error);
    } finally {
      setLoading(false);
    }
  });
}
</script>
