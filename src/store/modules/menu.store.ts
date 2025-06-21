import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", () => {
  const menuWidth = ref(0);

  const setMenuWidth = (width: string) => {
    menuWidth.value = parseInt(width);
  };
  return {
    menuWidth,
    setMenuWidth,
  };
});
