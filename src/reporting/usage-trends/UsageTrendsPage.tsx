import { DateTime } from 'luxon';
import { FC, useState } from 'react';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';

import { ReportingTitle } from '../ReportingTitle';

import { GrowthSummaryCards } from './GrowthSummaryCards';
import { UsageTrendChart } from './UsageTrendChart';
import { UsageTrendsFilter } from './UsageTrendsFilter';
import { useUsageTrends } from './useUsageTrends';
import { YearOverYearChart } from './YearOverYearChart';

export const UsageTrendsPage: FC = () => {
  const currentYear = DateTime.now().year;
  const [year, setYear] = useState(currentYear);

  const {
    isLoading,
    error,
    refetch,
    currentYearData,
    comparison,
    growthStats,
    availableYears,
  } = useUsageTrends({
    year,
  });

  return (
    <>
      <ReportingTitle reportKey="usage-trends">
        <UsageTrendsFilter
          year={year}
          onYearChange={setYear}
          availableYears={availableYears}
        />
      </ReportingTitle>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <>
          <GrowthSummaryCards stats={growthStats} year={year} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <UsageTrendChart monthlyData={currentYearData} year={year} />
            </div>
            <div>
              <YearOverYearChart comparison={comparison} year={year} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
