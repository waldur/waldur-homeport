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
  const periodOptions = useMemo(
    () => getUsageHistoryPeriodOptions(resource.created),
    [resource],
  );
  const [period, setPeriod] = useState(
    periodOptions.length > 1
      ? periodOptions[periodOptions.length - 2]
      : periodOptions[0],
  );

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Usage history')}</h3>
        </Card.Title>
        {periodOptions.length > 1 && (
          <div className="card-toolbar">
            <SelectControl
              options={periodOptions}
              value={period}
              onChange={setPeriod}
              className="w-150px"
            />
          </div>
        )}
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
