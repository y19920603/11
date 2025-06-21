const pokers = import.meta.glob("@/assets/poker/*.png", { eager: true });

export const getPoker = (name: string): string => {
  const imgModule = pokers[`/src/assets/poker/${name}.png`];
  return imgModule ? (imgModule as { default: string }).default : "";
};
