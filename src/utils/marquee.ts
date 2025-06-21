export const useMarqueeStatus = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("STATUS_ENABLE"),
    },
    {
      value: 0,
      label: t("STATUS_DISABLE"),
    },
  ];
};
