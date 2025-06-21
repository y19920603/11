export const useWhiteTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("WHITE_LIST_WHITE"),
    },
  ];
};
