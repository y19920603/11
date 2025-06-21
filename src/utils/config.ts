export interface AppConfig {
  MAX_IMAGE_SIZE_MB: number;
  MAX_DATE_TIME: string;
  EXPORT_FILE_URL: string;
}

export const defaultConfig: AppConfig = {
  MAX_IMAGE_SIZE_MB: 3,
  MAX_DATE_TIME: "2038-01-01 00:00:00",
  EXPORT_FILE_URL: "http://192.168.1.221:8039",
};

export const appConfig = ref<AppConfig>({ ...defaultConfig });

export async function loadAppConfig() {
  try {
    const res = await fetch("/config.json");
    const json = await res.json();
    appConfig.value = { ...defaultConfig, ...json };
  } catch (error) {
    console.error("載入設定檔失敗，將使用預設值。", error);
  }
}
