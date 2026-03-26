import { FC, useCallback, useMemo } from 'react';
import { UserLanguageCount } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';

import { BarChart } from './BarChart';
import { getChartExportData } from './utils';

interface LanguagesChartProps {
  data: UserLanguageCount[];
}

/**
 * Format language code to display name
 */
function formatLanguage(code: string): string {
  if (!code || code === 'unset') {
    return translate('Not set');
  }
  // Use Intl.DisplayNames if available for better language names
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
    return displayNames.of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export const LanguagesChart: FC<LanguagesChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Sort by count descending
    const sorted = [...data].sort((a, b) => b.count - a.count);

    let items: Array<{ name: string; value: number }>;

    if (sorted.length <= 10) {
      items = sorted.map((item) => ({
        name: formatLanguage(item.language),
        value: item.count,
      }));
    } else {
      const top9 = sorted.slice(0, 9);
      const rest = sorted.slice(9);
      const otherCount = rest.reduce((sum, item) => sum + item.count, 0);

      items = [
        ...top9.map((item) => ({
          name: formatLanguage(item.language),
          value: item.count,
        })),
        { name: translate('Other'), value: otherCount },
      ];
    }

    return items;
  }, [data]);

  const getExportData = useCallback(
    () => getChartExportData(translate('Language'), chartData),
    [chartData],
  );

  // Calculate height based on number of items (min 200px, max 400px)
  const chartHeight = useMemo(
    () => Math.min(400, Math.max(200, (chartData?.length || 0) * 35)),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Languages')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => (
        <BarChart
          ref={ref}
          data={chartData}
          horizontal={true}
          height={`${chartHeight}px`}
          isSorted={false}
        />
      )}
    </ChartCard>
  );
};
