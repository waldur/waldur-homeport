import { ChartBar, Table } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';

import { SelectControl } from '@waldur/form/SelectControl';
import { translate } from '@waldur/i18n';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';
import { getUsageHistoryPeriodOptions } from '../usage/utils';

export const UsageCard = ({ resource, offering }) => {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  const resourceRef = useMemo(
    () => ({
      offering_uuid: resource.offering_uuid,
      resource_uuid: resource.uuid,
    }),
    [resource, offering],
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
        <div className="card-toolbar gap-4">
          {periodOptions.length > 1 && (
            <SelectControl
              options={periodOptions}
              value={period}
              onChange={setPeriod}
              className="w-150px"
            />
          )}
          <Button
            variant="outline-default"
            className="btn-outline btn-icon"
            onClick={() =>
              setMode((prev) => (prev === 'chart' ? 'table' : 'chart'))
            }
          >
            <span className="svg-icon svg-icon-2">
              {mode === 'chart' ? <Table /> : <ChartBar />}
            </span>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <ResourceUsageTabsContainer
          resource={resourceRef}
          offering={offering}
          months={period.value}
          hideHeader={true}
          displayMode={mode}
        />
      </Card.Body>
    </Card>
  ) : null;
};
