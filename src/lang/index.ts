import type { App } from "vue";
import { createI18n } from "vue-i18n";
import { useAppStoreHook } from "@/store/modules/app.store";
// 本地语言包
import enLocale from "./package/en";
import CnLocale from "./package/cn";
import TwLocale from "./package/tw";
import DeLocale from "./package/de";
import EsLocale from "./package/es";
import ItLocale from "./package/it";
import JaLocale from "./package/ja";
import RuLocale from "./package/ru";
import { LanguageEnum } from "@/enums";

const appStore = useAppStoreHook();

const messages = {
  [LanguageEnum.EN]: { ...enLocale },
  [LanguageEnum.ZH_CN]: { ...CnLocale },
  [LanguageEnum.ZH_TW]: { ...TwLocale },
  [LanguageEnum.DE]: { ...DeLocale },
  [LanguageEnum.ES]: { ...EsLocale },
  [LanguageEnum.IT]: { ...ItLocale },
  [LanguageEnum.JA]: { ...JaLocale },
  [LanguageEnum.RU]: { ...RuLocale },
};

const i18n = createI18n({
  legacy: false,
  locale: appStore.language.toString(),
  fallbackLocale: LanguageEnum.EN.toString(),
  messages: messages,
  globalInjection: true,
});

// 全局注册 i18n
export function setupI18n(app: App<Element>) {
  app.use(i18n);
}

export default i18n;
