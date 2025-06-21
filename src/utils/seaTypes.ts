export const useSeaTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 0,
      label: t("SEA_TYPE_PRIVATE"),
    },
    {
      value: 1,
      label: t("SEA_TYPE_PUBLIC"),
    },
  ];
};
