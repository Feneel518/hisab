export function formatINRCompact(amount: number) {
  if (amount >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(1)}L`;
  }
  if (amount >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}


type CurrencyOptions = {
  currency?: "INR" | "USD" | "EUR";
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

export function formatCurrency(
  amount: number | null | undefined,
  opts: CurrencyOptions = {}
) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "₹0.00";
  }

  const {
    currency = "INR",
    locale = "en-IN",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = opts;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}