import { DateTime } from 'luxon';
import { FC, useMemo, useState, useCallback } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { FormGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';

import { MaintenanceTimelineChart } from '../charts/MaintenanceTimelineChart';
import { TimelineGrouping } from '../types';
import { toTimelineItems, STATE_LABELS, IMPACT_LABELS } from '../utils';

interface GroupingOption {
  value: TimelineGrouping;
  label: string;
}

interface ColorOption {
  value: 'state' | 'impact';
  label: string;
}

const groupingOptions: GroupingOption[] = [
  { value: 'provider', label: translate('By provider') },
  { value: 'offering', label: translate('By offering') },
];

const colorOptions: ColorOption[] = [
  { value: 'state', label: translate('By state') },
  { value: 'impact', label: translate('By impact') },
];

interface MaintenanceTimelineViewProps {
  announcements: MaintenanceAnnouncement[];
}

export const MaintenanceTimelineView: FC<MaintenanceTimelineViewProps> = ({
  announcements,
}) => {
  const [groupBy, setGroupBy] = useState<TimelineGrouping>('provider');
  const [colorBy, setColorBy] = useState<'state' | 'impact'>('state');

  const timelineItems = useMemo(
    () => toTimelineItems(announcements),
    [announcements],
  );

  const selectedGrouping = groupingOptions.find((o) => o.value === groupBy);
  const selectedColor = colorOptions.find((o) => o.value === colorBy);

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
      translate('Impact Level'),
    ];
    const data = timelineItems.map((item) => [
      item.name,
      STATE_LABELS[item.state] || item.state,
      item.providerName,
      item.offeringNames.join(', '),
      DateTime.fromJSDate(item.scheduledStart).toFormat('yyyy-MM-dd HH:mm'),
      DateTime.fromJSDate(item.scheduledEnd).toFormat('yyyy-MM-dd HH:mm'),
      IMPACT_LABELS[item.maxImpactLevel] || item.maxImpactLevel,
    ]);
    return { fields, data };
  }, [timelineItems]);

  const actions = (
    <div className="d-flex gap-4 me-4">
      <FormGroup label={translate('Group by')} className="mw-150px mb-0">
        <Select
          value={selectedGrouping}
          onChange={(option: GroupingOption | null) =>
            option && setGroupBy(option.value)
          }
          options={groupingOptions}
          isClearable={false}
        />
      </FormGroup>
      <FormGroup label={translate('Color by')} className="mw-150px mb-0">
        <Select
          value={selectedColor}
          onChange={(option: ColorOption | null) =>
            option && setColorBy(option.value)
          }
          options={colorOptions}
          isClearable={false}
        />
      </FormGroup>
    </div>
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
