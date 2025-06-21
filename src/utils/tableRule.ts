export const useTableRuleCategories = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 0,
      label: t("TABLE_RULE_CATEGORY_PUBLIC_DEMO"),
    },
    {
      value: 1,
      label: t("TABLE_RULE_CATEGORY_PUBLIC_CASH"),
    },
  ];
};

export const useTableRuleGoldTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 0,
      label: t("GOLD_TYPE_DOLLARS"),
    },
    {
      value: 1,
      label: t("GOLD_TYPE_EXPERIENCE_COINS"),
    },
  ];
};
