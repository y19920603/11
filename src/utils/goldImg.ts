const images = import.meta.glob("@/assets/gold/*.png", { eager: true });

const getGoldImg = (imageName: string) => {
  const imgModule = images[`/src/assets/gold/${imageName}.png`];

  return imgModule ? (imgModule as { default: string }).default : "";
};

export default getGoldImg;
