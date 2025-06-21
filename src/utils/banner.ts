export const usePublicTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 1,
      label: t("PUBLISH_LIST"),
    },
    {
      value: 0,
      label: t("PUBLISH_UN_LIST"),
    },
  ];
};
