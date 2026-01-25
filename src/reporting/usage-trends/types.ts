export interface MonthlyUsageData {
  period: string; // YYYY-MM format
  year: number;
  month: number;
  total_usage: number;
  resource_count: number;
  component_count: number;
}

export interface YearlyComparison {
  month: number;
  monthName: string;
  currentYear: number;
  previousYear: number;
  growthPercent: number;
}

export interface GrowthStats {
  totalUsage: number;
  monthOverMonthGrowth: number;
  yearOverYearGrowth: number;
  peakMonth: string;
  peakUsage: number;
}

// Month names
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
