import { ChartBar, Table } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Button, Card, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

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
      ? periodOptions[periodOptions.length - 2].value
      : periodOptions[0].value,
  );

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Usage history')}</h3>
        </Card.Title>
        <div className="card-toolbar gap-4">
          {periodOptions.length > 1 && (
            <ToggleButtonGroup
              type="radio"
              name="period"
              value={period}
              defaultValue={period}
              onChange={setPeriod}
            >
              {periodOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  id={'tbg-' + option.value}
                  value={option.value}
                  variant="outline btn-outline-default"
                >
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
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
          months={period}
          hideHeader={true}
          displayMode={mode}
        />
      </Card.Body>
    </Card>
  ) : null;
};
