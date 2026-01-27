export function getFinancialYearKey(d: Date) {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0=Jan ... 3=Apr

  const startYear = month >= 3 ? year : year - 1; // Apr=3
  const endYear = startYear + 1;

  const short = (y: number) => String(y).slice(-2);
  return `FY${short(startYear)}-${short(endYear)}`; // FY25-26
}

export function pad(n: number, size = 4) {
  return String(n).padStart(size, "0");
}
