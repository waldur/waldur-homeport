import { DateTime } from 'luxon';
import { FC, useMemo, useState, useCallback } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { FormHeading, SegmentedControl } from 'waldur-ui';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';

import { MaintenanceTimelineChart } from '../charts/MaintenanceTimelineChart';
import { TimelineColoring, TimelineGrouping } from '../types';
import {
  IMPACT_LABELS,
  STATE_LABELS,
  TIMING_LABELS,
  toTimelineItems,
} from '../utils';

interface GroupingOption {
  value: TimelineGrouping;
  label: string;
}

interface ColorOption {
  value: TimelineColoring;
  label: string;
}

const groupingOptions: GroupingOption[] = [
  { value: 'provider', label: translate('Provider') },
  { value: 'offering', label: translate('Offering') },
];

const colorOptions: ColorOption[] = [
  { value: 'state', label: translate('State') },
  { value: 'impact', label: translate('Impact') },
  { value: 'timing', label: translate('Timing') },
];

interface MaintenanceTimelineViewProps {
  announcements: MaintenanceAnnouncement[];
}

export const MaintenanceTimelineView: FC<MaintenanceTimelineViewProps> = ({
  announcements,
}) => {
  const [groupBy, setGroupBy] = useState<TimelineGrouping>('provider');
  const [colorBy, setColorBy] = useState<TimelineColoring>('state');

  const timelineItems = useMemo(
    () => toTimelineItems(announcements),
    [announcements],
  );

  const getExportData = useCallback((): ExportData => {
    if (!timelineItems || timelineItems.length === 0) {
      return { fields: [], data: [] };
    }
    const fields = [
      translate('Name'),
      translate('State'),
      translate('Provider'),
      translate('Offerings'),
      translate('Scheduled Start'),
      translate('Scheduled End'),
      translate('Actual Start'),
      translate('Actual End'),
      translate('Δ start (min)'),
      translate('Δ end (min)'),
      translate('Timing'),
      translate('Impact Level'),
    ];
    const data = timelineItems.map((item) => [
      item.name,
      STATE_LABELS[item.state] || item.state,
      item.providerName,
      item.offeringNames.join(', '),
      DateTime.fromJSDate(item.scheduledStart).toFormat('yyyy-MM-dd HH:mm'),
      DateTime.fromJSDate(item.scheduledEnd).toFormat('yyyy-MM-dd HH:mm'),
      item.actualStart
        ? DateTime.fromJSDate(item.actualStart).toFormat('yyyy-MM-dd HH:mm')
        : '',
      item.actualEnd
        ? DateTime.fromJSDate(item.actualEnd).toFormat('yyyy-MM-dd HH:mm')
        : '',
      item.startDeltaMinutes !== null ? String(item.startDeltaMinutes) : '',
      item.endDeltaMinutes !== null ? String(item.endDeltaMinutes) : '',
      TIMING_LABELS[item.timingBucket],
      IMPACT_LABELS[item.maxImpactLevel] || item.maxImpactLevel,
    ]);
    return { fields, data };
  }, [timelineItems]);

  const actions = (
    <>
      <div className="flex items-center gap-2">
        <FormHeading className="mb-0">{translate('Group by:')}</FormHeading>
        <SegmentedControl<TimelineGrouping>
          aria-label={translate('Group by')}
          size="sm"
          options={groupingOptions}
          value={groupBy}
          onValueChange={setGroupBy}
        />
      </div>
      <div className="flex items-center gap-2">
        <FormHeading className="mb-0">{translate('Color by:')}</FormHeading>
        <SegmentedControl<TimelineColoring>
          aria-label={translate('Color by')}
          size="sm"
          options={colorOptions}
          value={colorBy}
          onValueChange={setColorBy}
        />
      </div>
    </>
  );

  return (
    <ChartCard
      title={translate('Maintenance timeline')}
      getExportData={getExportData}
      isEmpty={timelineItems.length === 0}
      actions={actions}
    >
      {(ref) => (
        <MaintenanceTimelineChart
          chartRef={ref}
          items={timelineItems}
          groupBy={groupBy}
          colorBy={colorBy}
        />
      )}
    </ChartCard>
  );
};
