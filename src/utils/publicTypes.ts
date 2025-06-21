export const usePublicStartTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("PUBLISH_TIME_REAL_TIME"),
    },
    {
      value: 0,
      label: t("PUBLISH_TIME_SETTINGS"),
    },
  ];
};

export const usePublicEndTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("PUBLISH_TIME_NEVER"),
    },
    {
      value: 0,
      label: t("PUBLISH_TIME_SETTINGS"),
    },
  ];
};
