import { FC, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { MaintenanceTimelineChart } from '../charts/MaintenanceTimelineChart';
import { TimelineGrouping } from '../types';
import { toTimelineItems } from '../utils';

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

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>{translate('Maintenance timeline')}</Card.Title>
        <div className="d-flex gap-4">
          <FormGroup label={translate('Group by')} className="mw-150px mb-0">
            <Select
              value={selectedGrouping}
              onChange={(option: GroupingOption | null) =>
                option && setGroupBy(option.value)
              }
              options={groupingOptions}
              isClearable={false}
              className="metronic-select-container"
              classNamePrefix="metronic-select"
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
              className="metronic-select-container"
              classNamePrefix="metronic-select"
            />
          </FormGroup>
        </div>
      </Card.Header>
      <Card.Body>
        <MaintenanceTimelineChart
          items={timelineItems}
          groupBy={groupBy}
          colorBy={colorBy}
        />
      </Card.Body>
    </Card>
  );
};
