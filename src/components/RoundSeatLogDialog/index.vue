<template>
  <el-dialog v-model="props.visible" width="90vw" @close="emit('update:visible', false)">
    <template #title>
      <div
        class="text-center w-full text-xl"
        :class="{ 'cursor-pointer': !clientUid }"
        @click="showProcessDetail"
      >
        {{ t("ROUND_SEAT_LOG_DETAIL") }}
      </div>
    </template>
    <!-- main -->
    <div class="flex flex-col 2xl:flex-row 2xl:space-x-2 w-full">
      <div class="relative flex py-3">
        <img :src="cardTable" class="h-auto align-middle min-w-[320px] max-w-[400px] m-auto" />
        <div v-if="detailData" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <template v-for="index in [0, 1, 2]" :key="index">
            <RoundSeatLogDetailMainBoardCard :item="detailData[`board_card_${index}`]" />
          </template>
        </div>
      </div>
      <div
        v-if="mainData"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-0 w-full"
      >
        <template v-for="data in mainData">
          <RoundSeatLogDetailMainItem :title="data.title" :value="data.value" :span="data.span" />
        </template>
        <div
          v-if="clientUid"
          class="xl:col-span-1 flex flex-col justify-center items-center px-2 py-8 border-t-1 border-[#343747] border-solid after:content-[''] after:w-[2px] after:h-[60%] after:block after:absolute relative after:bg-#343747 after:right-0"
        >
          <img class="w-8 cursor-pointer" :src="pdf" @click="downloadPdf" />
        </div>
      </div>
    </div>
    <!-- seat -->
    <div
      class="sm:space-y-0 grid grid-cols-1 lgg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-4 lgg:border-t-1 lgg:border-[#343747] lgg:border-solid"
    >
      <template v-for="item in detailData?.seats">
        <div
          class="border-t-1 border-[#343747] border-solid lgg:border-t-0 p-2 py-4 space-y-2 sm:space-y-0 sm:flex sm:justify-between relative lgg:w-full after:content-[''] after:w-[2px] after:h-[60%] after:block after:absolute relative after:bg-#343747 after:right-0 after:top-6"
        >
          <RoundSeatLogDetailSeat :item="item" />
        </div>
      </template>
    </div>
    <!-- stages -->
    <div
      v-if="StageData"
      class="grid grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 2xl:grid-cols-4 2xll:grid-cols-5 gap-2"
    >
      <template v-for="stage in StageData">
        <RoundSeatLogDetailStage
          :title="stage.title"
          :current_pool_amount="stage.current_pool_amount"
          :steps="stage.steps"
        />
      </template>
    </div>
  </el-dialog>
  <el-drawer
    v-model="showProcessDetailDrawer"
    direction="ltr"
    :size="isSmallScreen ? '100%' : '40%'"
  >
    <template #title>
      <div class="text-center w-full cursor-pointer text-white" @click="showProcessDetail">
        {{ t("ROUND_SEAT_LOG_PROCESS_DETAIL") }}
      </div>
    </template>
    <pre>{{ detailData?.process_detail }}</pre>
  </el-drawer>
</template>
<script setup lang="ts">
import cardTable from "@/assets/images/card-table.png";
import pdf from "@/assets/images/download.png";
import RoundSeatLogAPI, { RoundSeatLogDetailVO, Stage } from "@/api/round_seat_log.api";
import { useLoadingStore } from "@/store";
import { errorAlert, getDataErrorAlert } from "@/utils/message";
import downloadPDFUtil from "@/utils/pdf";

const route = useRoute();

const showProcessDetailDrawer = ref(false);
const showProcessDetail = () => {
  if (!clientUid.value) {
    showProcessDetailDrawer.value = true;
  }
};

const clientUid = computed(() => route.query.client_uid);

const downloadPdf = () => {
  downloadPDFUtil(
    "/player-game-log/pdf",
    {
      client_uid: route.query.client_uid,
      start_datetime: route.query.start_datetime,
      end_datetime: route.query.end_datetime,
    },
    "player-game-log"
  );
};

const props = defineProps<{
  roundId: string | null;
  visible: boolean;
}>();
const emit = defineEmits(["update:visible"]);
const { t } = useI18n();

const { setLoading } = useLoadingStore();

const detailData = ref<RoundSeatLogDetailVO | null>(null);

watch(
  () => props.visible,
  (visible) => {
    if (visible && props.roundId) {
      fetchDetail(props.roundId);
    }
  }
);

const mainData: ComputedRef<{ title: string; value: string | number; span?: number }[] | null> =
  computed(() => {
    if (detailData.value) {
      return [
        { title: t("ROUND_SEAT_LOG_TABLE_ID"), value: String(detailData.value!.table_id) },
        { title: t("ROUND_SEAT_LOG_ROUND_ID"), value: String(detailData.value!.round_id) },
        {
          title: t("ROUND_SEAT_LOG_ROUND_START_TIME"),
          value: String(detailData.value!.round_start_time),
          span: 2,
        },
        {
          title: t("ROUND_SEAT_LOG_ROUND_END_TIME"),
          value: String(detailData.value!.round_end_time),
          span: 2,
        },
        { title: t("ROUND_SEAT_LOG_TABLE_TYPE"), value: String(detailData.value!.sea_type_name) },
        {
          title: t("ROUND_SEAT_LOG_GAME_TYPE"),
          value: `${detailData.value!.game_type_name}(${detailData.value!.game_type})`,
          span: 2,
        },
        { title: t("ROUND_SEAT_LOG_AF_NAME"), value: String(detailData.value!.AF_name) },
        { title: t("ROUND_SEAT_LOG_RAKE"), value: String(detailData.value!.rake) },
        { title: t("ROUND_SEAT_LOG_RAKE_GOLD"), value: String(detailData.value!.rake_gold) },
        { title: t("ROUND_SEAT_LOG_BUY_EV_GOLD"), value: String(detailData.value!.buy_ev_gold) },
      ];
    }
    return null;
  });

const StageData: ComputedRef<Stage[] | null> = computed(() => {
  if (detailData.value) {
    return [
      {
        title: t("ROUND_SEAT_LOG_BLIND_ANTE"),
        current_pool_amount: detailData.value!.stage0.current_pool_amount,
        steps: detailData.value!.stage0.steps,
      },
      {
        title: t("ROUND_SEAT_LOG_FLOP_PRE"),
        current_pool_amount: detailData.value!.stage1.current_pool_amount,
        steps: detailData.value!.stage1.steps,
      },
      {
        title: t("ROUND_SEAT_LOG_FLOP"),
        current_pool_amount: detailData.value!.stage2.current_pool_amount,
        steps: detailData.value!.stage2.steps,
      },
      {
        title: t("ROUND_SEAT_LOG_TURN_CARD"),
        current_pool_amount: detailData.value!.stage3.current_pool_amount,
        steps: detailData.value!.stage3.steps,
      },
      {
        title: t("ROUND_SEAT_LOG_RIVER"),
        current_pool_amount: detailData.value!.stage4.current_pool_amount,
        steps: detailData.value!.stage4.steps,
      },
    ];
  }
  return null;
});

const fetchDetail = async (roundId: string) => {
  setLoading(true);
  try {
    const res = await RoundSeatLogAPI.getDetail({ round_id: roundId });
    if (res.result) {
      detailData.value = res.data;
    } else {
      errorAlert(t, res.msg);
      emit("update:visible", false);
    }
  } catch (err) {
    getDataErrorAlert(t, "PAGE_ROUND_SEAT_LOG");
    console.error(err);
    emit("update:visible", false);
  } finally {
    setLoading(false);
  }
};

const isSmallScreen = ref(false);

const checkScreen = () => {
  isSmallScreen.value = window.innerWidth < 640; // 或你要的斷點，例如 768
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkScreen);
});

onMounted(() => {
  checkScreen();
  window.addEventListener("resize", checkScreen);
});
</script>
