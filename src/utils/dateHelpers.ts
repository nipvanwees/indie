export const localeDateTime = (date: Date) => {
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

export const localeDate = (date: Date) => {
  return date.toLocaleDateString();
};