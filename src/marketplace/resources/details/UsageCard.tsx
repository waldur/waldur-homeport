import { ChartBarIcon, TableIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Card, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { marketplaceResourcesTeamList, Resource } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { ResourceUsageTabsContainer } from '../usage/ResourceUsageTabsContainer';
import { UsageExportDropdown } from '../usage/UsageExportDropdown';
import { getComponentsAndUsages } from '../usage/utils';
import { getUsageHistoryPeriodOptions } from '../usage/utils';

export const UsageCard = ({ resource }: { resource: Resource }) => {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  const resourceRef = useMemo(
    () => ({
      name: resource.name,
      uuid: resource.uuid,
      customer_name: resource.customer_name,
      project_name: resource.project_name,
      backend_id: resource.backend_id,
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

    staleTime: UI_STALE_TIME,
  });

  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['UsageCard', resourceRef, period],
    queryFn: () => getComponentsAndUsages(resourceRef.uuid, period),
  });

  const usersFilterOptions = useMemo(() => {
    if (!team?.length || !value?.userUsages?.length) return [];
    return team.filter((user) =>
      value.userUsages.some(
        (record) =>
          record.username === user.offering_user_username && record.usage > 0,
      ),
    );
  }, [team, value]);

  return (resource.is_usage_based || resource.is_limit_based) &&
    resource.state !== 'Creating' ? (
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
              className="min-w-150px min-w-lg-200px"
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
                  variant="tertiary"
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

          <ActionButton
            variant="tertiary"
            action={() =>
              setMode((prev) => (prev === 'chart' ? 'table' : 'chart'))
            }
            iconNode={
              mode === 'chart' ? (
                <TableIcon weight="bold" />
              ) : (
                <ChartBarIcon weight="bold" />
              )
            }
          />
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
