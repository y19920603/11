<template>
  <!-- <TimeProgress /> -->
  <PageTitle title="DASHBOARD">
    <!-- <DateTimeFilter
      :startDateTime="startDateTime"
      :endDateTime="endDateTime"
      @updateStartDateTime="updateStartDateTime"
      @updateEndDateTime="updateEndDateTime"
      @search="handleQuery"
    /> -->
  </PageTitle>
  <div class="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
    <DashBoardCardItem v-for="item in dashBoardCards" :item="item" />
  </div>
  <div class="bg-[#2c2e3b] xl:w-1/2 h-[650px] m-8 rounded-xl">
    <div class="w-full flex justify-center items-center p-4">
      <div class="border-b-1 w-full text-center p-4 border-b-gray text-xl">
        {{ $t("DASHBOARD_GAME_ROUND_RATIO") }}
      </div>
    </div>
    <ECharts :options="chartOptions" height="500px" />
  </div>
</template>
<script setup lang="ts">
import dayjs from "dayjs";
import DashBoardAPI, {
  DashBoardPageQuery,
  DashBoardCard,
  DashBoardData,
  GameProportion,
} from "@/api/dashboard.api";

const chartOptions = ref();

const loading = ref(false);
const dashBoardCards = ref<DashBoardCard[]>([] as DashBoardCard[]);

const queryParams = reactive<DashBoardPageQuery>({
  start_datetime: `${dayjs().format("YYYY-MM-DD")} 00:00:00`,
  end_datetime: `${dayjs().format("YYYY-MM-DD")} 23:59:59`,
  date_mode: null,
});

// const startDateTime = computed({
//   get: () => queryParams.start_datetime,
//   set: (newValue: string) => {
//     queryParams.start_datetime = newValue;
//   },
// });

// const endDateTime = computed({
//   get: () => queryParams.end_datetime,
//   set: (newValue: string) => {
//     queryParams.end_datetime = newValue;
//   },
// });

// const updateStartDateTime = (newStart: string) => {
//   queryParams.start_datetime = newStart;
// };

// const updateEndDateTime = (newEnd: string) => {
//   queryParams.end_datetime = newEnd;
// };

// 查询
function handleQuery() {
  loading.value = true;
  DashBoardAPI.getDashBoardData(queryParams)
    .then(({ result, data }) => {
      if (result) {
        dashBoardCards.value = transDashBoardData(data);
        updateChartOptions(data.game_proportions);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

const updateChartOptions = (data: GameProportion[]) => {
  chartOptions.value = {
    tooltip: {
      trigger: "axis",
      showContent: false,
    },
    legend: {
      orient: "horizontal",
      bottom: "0px",
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        type: "pie",
        radius: "80%",
        data: data.map((d) => ({ name: d[0], value: parseFloat(d[1]) })),
        label: {
          show: true,
          position: "inside",
          formatter: "{b} {c}%",
          color: "#fff",
        },
        // 圓餅圖選中和懸停樣式
        emphasis: {
          focus: "self",
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
};

const transDashBoardData = (d: DashBoardData) => {
  return [
    {
      title: "DASHBOARD_TOTAL_REVENUE",
      total: d.total_revenue_chart_total,
      growth: d.total_revenue_chart_growing_up,
      trend: d.total_revenue_chart_trend,
      image: "sea-public-security-deposit-amount",
    },
    {
      title: "DASHBOARD_MONTHLY_REVENUE",
      total: d.orders_chart_total,
      growth: d.orders_chart_growing_up,
      trend: d.orders_chart_trend,
      image: "sea-public-security-deposit-amount",
    },
    {
      title: "DASHBOARD_TOTAL_GAME_ROUNDS",
      total: d.total_game_board_total,
      growth: d.total_game_board_growing_up,
      trend: d.total_game_board_trend,
      image: "total-game-board",
    },
    {
      title: "DASHBOARD_TOTAL_AGENTS",
      total: d.total_company_name_total,
      growth: d.total_company_name_growing_up,
      trend: d.total_company_name_trend,
      image: "total-company-name",
    },
    {
      title: "DASHBOARD_TOTAL_PLAYERS",
      total: d.total_player_total,
      growth: d.total_player_growing_up,
      trend: d.total_player_trend,
      image: "total-player",
    },
    {
      title: "DASHBOARD_GAME_DEPOSIT_AMOUNT",
      total: d.game_deposit_amount_total,
      growth: d.game_deposit_amount_growing_up,
      trend: d.game_deposit_amount_trend,
      image: "game-deposit-amount",
    },
    {
      title: "DASHBOARD_GAME_WITHDRAWAL_AMOUNT",
      total: d.game_withdrawal_amount_total,
      growth: d.game_withdrawal_amount_growing_up,
      trend: d.game_withdrawal_amount_trend,
      image: "game-withdrawal-amount",
    },
    {
      title: "DASHBOARD_ONLINE_PLAYERS",
      total: d.online_player_now,
      growth: d.online_player_Increase,
      trend: d.online_player_trend,
      image: "online-player",
    },
    {
      title: "DASHBOARD_PLAYERS_IN_GAME",
      total: d.online_game_player_total,
      growth: d.online_game_player_growing_up,
      trend: 3,
      image: "online-game-player",
    },
    {
      title: "DASHBOARD_TOTAL_HIGH_SEAS_AGENTS",
      total: d.sea_public_company_total,
      growth: d.sea_public_company_growing_up,
      trend: d.sea_public_company_trend,
      image: "sea-public-company_name",
    },
    {
      title: "DASHBOARD_HIGH_SEAS_PLAYER_OPEN_TABLES",
      total: d.sea_public_player_total,
      growth: d.sea_public_player_growing_up,
      trend: d.sea_public_player_trend,
      image: "sea-public-player",
    },
    {
      title: "DASHBOARD_HIGH_SEAS_MARGIN",
      total: d.security_deposit_amount_total,
      growth: d.security_deposit_amount_growing_up,
      trend: d.security_deposit_amount_trend,
      image: "sea-public-security-deposit-amount",
    },
    {
      title: "DASHBOARD_REGISTER_TOTAL_PLAYERS",
      total: d.account_amount,
      growth: "",
      trend: "",
      image: "total-player",
    },
  ] as DashBoardCard[];
};

onMounted(() => {
  handleQuery();
});
</script>
