const priceFormatter = new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 });

// Dates come as "YYYY-MM-DD" (UTC midnight), so they are formatted in UTC to avoid a day shift
const dateFormatter = new Intl.DateTimeFormat('fr-CH', { dateStyle: 'medium', timeZone: 'UTC' });

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export const formatPrice = (price: number) => priceFormatter.format(price);

export const formatDate = (date: string) => dateFormatter.format(new Date(date));

export const countNights = (startDate: string, endDate: string) =>
  Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / ONE_DAY_IN_MS);
