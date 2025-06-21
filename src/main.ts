import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";

import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "animate.css";
import "default-passive-events";
import "@mdi/font/css/materialdesignicons.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.min.css";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import "vue3-country-intl/lib/vue3-country-intl.css";
import vCan from "./directives/can";

import { loadAppConfig } from "./utils/config";

async function init() {
  await loadAppConfig(); // <== 等待設定載入完再啟動 app
  const app = createApp(App);
  app.use(setupPlugins);
  app.directive("can", vCan);
  app.mount("#app");
}

init();
