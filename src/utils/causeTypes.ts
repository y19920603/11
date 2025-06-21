export const useCauseTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    { cause: "39", cause_text: t("MASTER_PROFIT_COMMISSION") },
    { cause: "40", cause_text: t("MASTER_PROFIT_WITHDRAWAL") },
  ];
};
