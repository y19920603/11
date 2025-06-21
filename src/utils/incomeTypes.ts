export const useIncomeTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    { value: "game_profit", label: t("INCOME_TYPE_GAME_PROFIT") },
    { value: "ev_compensation", label: t("INCOME_TYPE_EV_COMPENSATION") },
    { value: "ev_income", label: t("INCOME_TYPE_EV_INCOME") },
  ];
};
