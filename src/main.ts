import { createApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";

import "element-plus/theme-chalk/dark/css-vars.css";
import "@/styles/dark/css-vars.css";
import "@/styles/index.scss";
import "uno.css";
import "tailwindcss";
import "animate.css";
import "default-passive-events";

const app = createApp(App);
app.use(setupPlugins);
app.mount("#app");
