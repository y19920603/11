export const useStatusTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("WHITE_LIST_EFFECTIVE"),
    },
    {
      value: 0,
      label: t("WHITE_LIST_INEFFECTIVE"),
    },
  ];
};
