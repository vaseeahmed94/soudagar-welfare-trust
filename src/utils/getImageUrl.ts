const imageUrls = import.meta.glob<string>("../assets/images/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
});

export const getImageUrl = (name: string): string => {
  const imageUrl = imageUrls[`../assets/images/${name}.jpg`];
  if (!imageUrl) throw new Error(`Unknown image asset: ${name}`);
  return imageUrl;
};
