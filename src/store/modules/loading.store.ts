import { defineStore } from "pinia";

export const useLoadingStore = defineStore("loading", () => {
  const loading = useStorage<boolean>("loading", false);

  const setLoading = (status: boolean) => {
    loading.value = status;
  };
  return {
    loading,
    setLoading,
  };
});
