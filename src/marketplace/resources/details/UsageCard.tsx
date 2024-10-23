import { ChartBar, Table } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Button, Card, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getResourceTeam } from '@waldur/marketplace/common/api';

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

  const [users, setUsers] = useState([]);
  const {
    data: team,
    isLoading: teamIsLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery(
    ['ResourceTeam', resource.uuid],
    () => getResourceTeam(resource.uuid),
    { staleTime: 3 * 60 * 1000 },
  );

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Usage history')}</h3>
        </Card.Title>
        <div className="card-toolbar gap-4">
          {teamError ? (
            <LoadingErred message={translate('Error')} loadData={refetchTeam} />
          ) : (
            <Select
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.full_name}
              value={users}
              isMulti
              placeholder={translate('All users')}
              onChange={(value) => setUsers(value)}
              options={team || []}
              isLoading={teamIsLoading}
              className="metronic-select-container min-w-150px min-w-lg-200px"
              classNamePrefix="metronic-select"
            />
          )}
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
          users={users}
        />
      </Card.Body>
    </Card>
  ) : null;
};
