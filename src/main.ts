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

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

const app = createApp(App);
app.use(setupPlugins);
app.mount("#app");
