export const useTableTypes = (t: (key: string, ...args: any[]) => string) => {
  return [
    {
      value: 0,
      label: t("TABLE_TYPE_PRIVATE_TABLE"),
    },
    {
      value: 1,
      label: t("TABLE_TYPE_PUBLIC_TABLE"),
    },
  ];
};
