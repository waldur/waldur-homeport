import { useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';

import { SelectControl } from '@waldur/form/SelectControl';
import { translate } from '@waldur/i18n';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';
import { getUsageHistoryPeriodOptions } from '../usage/utils';

export const UsageCard = ({ resource }) => {
  const resourceRef = useMemo(
    () => ({
      offering_uuid: resource.offering_uuid,
      resource_uuid: resource.uuid,
    }),
    [resource],
  );
  const periodOptions = useMemo(() => getUsageHistoryPeriodOptions(), []);
  const [period, setPeriod] = useState(
    periodOptions.find((op) => op.value === 12),
  );

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card className="mb-10" id="usage-history">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Usage history')}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <SelectControl
            options={periodOptions}
            value={period}
            onChange={setPeriod}
            className="w-150px"
          />
        </div>
      </Card.Header>
      <Card.Body>
        <ResourceUsageTabsContainer
          resource={resourceRef}
          months={period.value}
          hideHeader={true}
        />
      </Card.Body>
    </Card>
  ) : null;
};
