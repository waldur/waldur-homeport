import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { marketplaceStatsAggregatedUsageTrendsList } from 'waldur-js-client';

import { LONG_STALE_TIME } from '@/core/constants';

import { MonthlyUsageData } from './types';
import {
  calculateGrowthStats,
  calculateYearOverYearComparison,
  getAvailableYears,
} from './utils';

interface UseUsageTrendsOptions {
  year?: number;
  offering_uuid?: string;
}

export const useUsageTrends = (options: UseUsageTrendsOptions = {}) => {
  const currentYear = DateTime.now().year;
  const { year = currentYear } = options;

  // Fetch aggregated usage trends from new backend endpoint
  const usageQuery = useQuery({
    queryKey: ['usage-trends-aggregated'],
    queryFn: async ({ signal }) => {
      const response = await marketplaceStatsAggregatedUsageTrendsList({
        query: {
          page_size: 1000, // Get all available data
        },
        signal,
      });

      // Transform to our format
      const data = response.data;
      return data.map((item): MonthlyUsageData => ({
        period: item.period,
        year: item.year,
        month: item.month,
        total_usage: parseFloat(item.total_usage) || 0,
        resource_count: item.resource_count,
        component_count: item.component_count,
      }));
    },
    staleTime: LONG_STALE_TIME, // 10 minutes
  });

  // Filter and process data by year
  const currentYearData = useMemo(() => {
    if (!usageQuery.data) return [];
    return usageQuery.data.filter((d) => d.year === year);
  }, [usageQuery.data, year]);

  const previousYearData = useMemo(() => {
    if (!usageQuery.data) return [];
    return usageQuery.data.filter((d) => d.year === year - 1);
  }, [usageQuery.data, year]);

  // Calculate derived data
  const comparison = useMemo(() => {
    if (currentYearData.length === 0 && previousYearData.length === 0) {
      return [];
    }
    return calculateYearOverYearComparison(currentYearData, previousYearData);
  }, [currentYearData, previousYearData]);

  const growthStats = useMemo(() => {
    if (currentYearData.length === 0 && previousYearData.length === 0) {
      return {
        totalUsage: 0,
        monthOverMonthGrowth: 0,
        yearOverYearGrowth: 0,
        peakMonth: '',
        peakUsage: 0,
      };
    }
    return calculateGrowthStats(currentYearData, previousYearData);
  }, [currentYearData, previousYearData]);

  const availableYears = useMemo(() => getAvailableYears(), []);

  return {
    isLoading: usageQuery.isLoading,
    error: usageQuery.error,
    refetch: usageQuery.refetch,
    currentYearData,
    previousYearData,
    comparison,
    growthStats,
    availableYears,
    selectedYear: year,
  };
};
