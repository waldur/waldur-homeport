import { translate } from 'waldur-i18n-runtime';
import { SegmentedControl } from 'waldur-ui';

import { getSlotColumns, getTaskColumns } from '../columns';
import { PageHeader, QueryTableCard } from '../components';
import { Provider } from '../providers';
import { useTasks, useTeamSlots } from '../queries';
import { navigate, pageHref, useRoute } from '../router';

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
  const tasks = useTasks(provider?.uuid);
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
        <QueryTableCard
          query={tasks}
          columns={getTaskColumns()}
          rowKey={(task) => task.key}
          emptyMessage={translate('Nothing is waiting for you.')}
        />
      ) : (
        <QueryTableCard
          query={slots}
          columns={getSlotColumns()}
          rowKey={(slot) => slot.uuid}
          emptyMessage={translate('Your team has no open assessments.')}
        />
      )}
    </div>
  );
};
