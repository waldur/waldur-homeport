import { useMemo } from 'react';
import { createFetcher } from 'waldur-api-client';
import { translate } from 'waldur-i18n-runtime';
import { proposalMyTasksList } from 'waldur-js-client';
import { Table, useTable } from 'waldur-table';
import { SegmentedControl } from 'waldur-ui';

import { getSlotColumns, getTaskColumns } from '../columns';
import { PageHeader, QueryTable, useStableColumns } from '../components';
import { Provider } from '../providers';
import { useTeamSlots } from '../queries';
import { navigate, pageHref, useRoute } from '../router';

const fetchTasks = createFetcher(proposalMyTasksList);

/** What the backend has given the user to do, a page at a time. */
const MyTasksTable = ({ providerUuid }: { providerUuid?: string }) => {
  const filter = useMemo(
    () => (providerUuid ? { provider_uuid: providerUuid } : {}),
    [providerUuid],
  );
  const tableProps = useTable({
    table: 'provider-calls-my-tasks',
    fetchData: fetchTasks,
    filter,
  });
  return (
    <Table
      {...tableProps}
      columns={useStableColumns(getTaskColumns())}
      rowKey="key"
      // The page header names the list.
      hasActionBar={false}
      emptyMessage={translate('Nothing is waiting for you.')}
    />
  );
};

/**
 * The offering team's assessments. "Mine" is what the backend has given the
 * user to do; "Team" is every open slot of the provider's accepted offerings,
 * whoever holds it, which is what an owner or a lead watches.
 *
 * Writing an assessment, and handing a slot on, stay on the portal's
 * proposal page for now: each row links there.
 */
export const TeamWorkPage = ({ provider }: { provider?: Provider }) => {
  const { params } = useRoute();
  const tab = params.get('tab') ?? 'team';
  const slots = useTeamSlots(provider?.uuid);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Team work')}
        description={translate(
          'Assessments the calls hand to your offering teams, soonest due first.',
        )}
      />
      <SegmentedControl
        className="self-start"
        value={tab}
        onValueChange={(value: string) =>
          navigate(pageHref('team', { tab: value }))
        }
        options={[
          { value: 'team', label: translate('Team slots') },
          { value: 'mine', label: translate('My tasks') },
        ]}
      />
      {tab === 'mine' ? (
        <MyTasksTable providerUuid={provider?.uuid} />
      ) : (
        <QueryTable
          table="provider-calls-team-slots"
          query={slots}
          columns={getSlotColumns()}
          emptyMessage={translate('Your team has no open assessments.')}
        />
      )}
    </div>
  );
};
