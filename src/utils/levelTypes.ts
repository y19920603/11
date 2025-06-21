export const useLevelTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("RULE_LV_LOW"),
    },
    {
      value: 2,
      label: t("RULE_LV_MEDIUM"),
    },
    {
      value: 3,
      label: t("RULE_LV_HIGH"),
    },
  ];
};
