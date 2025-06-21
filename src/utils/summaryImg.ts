const images = import.meta.glob("@/assets/summary/*.png", { eager: true });

const getSummaryImg = (imageName: string) => {
  const imgModule = images[`/src/assets/summary/${imageName}.png`];

  return imgModule ? (imgModule as { default: string }).default : "";
};

export default getSummaryImg;
