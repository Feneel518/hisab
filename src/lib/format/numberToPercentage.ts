export const numberToPercentage = (
  value?: number | null,
  decimals = 0
): string => {
  if (value === null || value === undefined || isNaN(value)) return "0%";

  return `${Number(value).toFixed(decimals)}%`;
};
