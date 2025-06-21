const images = import.meta.glob("@/assets/menu/*.png", { eager: true });

const getMenuImg = (imageName: string) => {
  const imgModule = images[`/src/assets/menu/${imageName}.png`];

  return imgModule ? (imgModule as { default: string }).default : "";
};

export default getMenuImg;
