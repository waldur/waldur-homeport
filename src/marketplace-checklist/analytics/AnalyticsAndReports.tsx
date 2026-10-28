import { ExportIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { BaseButton, SegmentedControl } from 'waldur-ui';

import { translate } from '@/i18n';

import { ChecklistUsageAnalyticsTable } from './ChecklistUsageAnalyticsTable';
import { OrgPerformanceTable } from './OrgPerformanceTable';
import { StatWidgetCard } from './StatWidgetCard';

const periodOptions = [
  { label: translate('{n} days', { n: 7 }), value: 7 },
  { label: translate('1 month'), value: 30 },
  { label: translate('{month} months', { month: 6 }), value: 6 * 30 },
];

// Dummy data for top cards and tables (replace with real API calls as needed)
const topCards = [
  {
    label: translate('Average Compliance Rate'),
    value: '73%',
    trend: -2,
  },
  {
    label: translate('Organizations'),
    value: '89',
    trend: 100,
  },
  {
    label: translate('Total Checklists'),
    value: '127',
    trend: 100,
  },
  {
    label: translate('Total Questions'),
    value: '1,847',
    trend: 100,
  },
];

export const AnalyticsAndReports = () => {
  const [period, setPeriod] = useState(
    periodOptions.length > 1
      ? periodOptions[periodOptions.length - 2].value
      : periodOptions[0].value,
  );

  return (
    <div className="card">
      <div className="card-header mx-0 border-0">
        <div className="card-toolbar gap-3">
          {periodOptions.length > 1 && (
            <SegmentedControl<number>
              aria-label={translate('Time period')}
              options={periodOptions}
              value={period}
              onValueChange={setPeriod}
            />
          )}
          <BaseButton
            onClick={() => {}}
            label={translate('Export report')}
            iconNode={<ExportIcon weight="bold" />}
            variant="tertiary"
            size="lg"
          />
        </div>
      </div>
      <div className="card-body p-0 overflow-hidden">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 mb-4 gap-4">
          {topCards.map((card) => (
            <div key={card.label}>
              <StatWidgetCard
                label={card.label}
                value={card.value}
                changes={card.trend}
              />
            </div>
          ))}
        </div>

        {/* Compliance & Checklist Usage Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 mb-4 gap-4">
          <div>
            <ChecklistUsageAnalyticsTable />
          </div>
        </div>

        {/* Organization Performance Comparison Table */}
        <OrgPerformanceTable />
      </div>
    </div>
  );
};
