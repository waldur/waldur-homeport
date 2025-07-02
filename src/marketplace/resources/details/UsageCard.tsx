import { ChartBarIcon, TableIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Button, Card, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { marketplaceResourcesTeamList } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';
import { UsageExportDropdown } from '../usage/UsageExportDropdown';
import { getComponentsAndUsages } from '../usage/utils';
import { getUsageHistoryPeriodOptions } from '../usage/utils';

export const UsageCard = ({ resource }) => {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  const resourceRef = useMemo(
    () => ({
      name: resource.name,
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
      ? periodOptions[periodOptions.length - 2].value
      : periodOptions[0].value,
  );

  const [users, setUsers] = useState([]);
  const {
    data: team,
    isLoading: teamIsLoading,
    error: teamError,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ['ResourceTeam', resource.uuid],

    queryFn: () =>
      marketplaceResourcesTeamList({ path: { uuid: resource.uuid } }).then(
        (r) => r.data,
      ),

    staleTime: 3 * 60 * 1000,
  });

  const { loading, error, value } = useAsync(
    () => getComponentsAndUsages(resourceRef.resource_uuid, period),
    [resourceRef, period],
  );

  const usersFilterOptions = useMemo(() => {
    if (!team?.length || !value?.userUsages?.length) return [];
    return team.filter((user) =>
      value.userUsages.some(
        (record) =>
          record.username === user.offering_user_username && record.usage > 0,
      ),
    );
  }, [team, value]);

  return resource.is_usage_based || resource.is_limit_based ? (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Usage history')}</h3>
        </Card.Title>
        <div className="card-toolbar gap-4">
          {teamError ? (
            <LoadingErred message={translate('Error')} loadData={refetchTeam} />
          ) : usersFilterOptions.length > 0 ? (
            <Select
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) => option.full_name || option.username}
              value={users}
              isMulti
              placeholder={translate('All users')}
              onChange={(value) => setUsers(value)}
              options={usersFilterOptions}
              isLoading={teamIsLoading}
              className="metronic-select-container min-w-150px min-w-lg-200px"
              classNamePrefix="metronic-select"
            />
          ) : null}
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
          <UsageExportDropdown
            resource={resourceRef}
            data={value}
            users={team}
            months={period}
          />

          <Button
            variant="outline-default"
            className="btn-outline btn-icon"
            onClick={() =>
              setMode((prev) => (prev === 'chart' ? 'table' : 'chart'))
            }
          >
            <span className="svg-icon svg-icon-2">
              {mode === 'chart' ? <TableIcon /> : <ChartBarIcon />}
            </span>
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>
            {translate('Unable to load data')}
            <br />
            {error.message}
          </>
        ) : !value.components.length ? (
          <h3>
            {translate('Offering does not have any usage-based components.')}
          </h3>
        ) : (
          <ResourceUsageTabsContainer
            resource={resourceRef}
            data={value}
            months={period}
            hideHeader={true}
            displayMode={mode}
            users={users}
          />
        )}
      </Card.Body>
    </Card>
  ) : null;
};
