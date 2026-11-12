import { translate } from 'waldur-i18n-runtime';
import { StatCardGrid } from 'waldur-ui';

import { getRequestColumns, getSlotColumns, getTaskColumns } from '../columns';
import {
  InternalLink,
  PageHeader,
  QueryTable,
  TableQuery,
  withRows,
} from '../components';
import { DASH } from '../format';
import { Provider } from '../providers';
import {
  useAwardOrders,
  useRequestedOfferings,
  useTasks,
  useTaskSummary,
  useTeamSlots,
} from '../queries';
import { pageHref } from '../router';

import { getAwardColumns } from './AwardsPage';

const SHOWN = 5;

const More = ({ total, href }: { total: number; href: string }) =>
  total > SHOWN ? (
    <div className="border-t border-t-secondary p-3 text-sm">
      <InternalLink href={href}>
        {translate('See all {count}', { count: total })}
      </InternalLink>
    </div>
  ) : null;

/**
 * What needs the user now, for the selected provider: their own tasks, the
 * calls waiting for an answer, and the team's open slots soonest due. An
 * owner who does not assess sees no tasks of their own, but still sees the
 * requests and the team's slots, which is their oversight. Both owners and
 * offering managers approve the orders awards place on their offerings.
 */
export const InboxPage = ({ provider }: { provider?: Provider }) => {
  const providerUuid = provider?.uuid;
  const summary = useTaskSummary(providerUuid);
  const tasks = useTasks(providerUuid);
  const waiting = useRequestedOfferings(providerUuid, ['requested']);
  const slots = useTeamSlots(providerUuid);
  const awards = useAwardOrders(providerUuid, ['pending-provider']);

  const overdueSlots = (slots.data ?? []).filter((slot) => slot.overdue);
  const isTeam = !provider || provider.isOfferingManager;

  const top = <T,>(query: TableQuery<T>) =>
    withRows(query, query.data?.slice(0, SHOWN));

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Inbox')}
        description={
          provider
            ? translate('What needs you in calls for {provider}.', {
                provider: provider.name,
              })
            : translate('What needs you in calls.')
        }
      />

      <StatCardGrid
        spaceless
        stats={[
          {
            label: translate('My open tasks'),
            value: summary.data?.total ?? DASH,
            footer: summary.data
              ? translate('{count} due within {days} days', {
                  count: summary.data.due_soon,
                  days: summary.data.due_soon_days,
                })
              : undefined,
          },
          {
            label: translate('Overdue tasks'),
            value: summary.data?.overdue ?? DASH,
            tone: summary.data?.overdue ? 'danger' : undefined,
          },
          {
            label: translate('Requests to answer'),
            value: waiting.data?.length ?? DASH,
            tone: waiting.data?.length ? 'warning' : undefined,
            link: { to: pageHref('requests'), label: translate('Answer') },
          },
          {
            label: translate('Open team slots'),
            value: slots.data?.length ?? DASH,
            footer: slots.data
              ? translate('{count} overdue', { count: overdueSlots.length })
              : undefined,
            tone: overdueSlots.length ? 'danger' : undefined,
            link: { to: pageHref('team'), label: translate('View all') },
          },
          {
            label: translate('Awards to provision'),
            value: awards.data?.length ?? DASH,
            tone: awards.data?.length ? 'warning' : undefined,
            link: { to: pageHref('awards'), label: translate('Review') },
          },
        ]}
      />

      {isTeam ? (
        <QueryTable
          table="provider-calls-inbox-tasks"
          hasPagination={false}
          title={translate('My tasks')}
          query={top(tasks)}
          columns={getTaskColumns()}
          rowKey="key"
          emptyMessage={translate('Nothing is waiting for you.')}
          footer={
            <More
              total={tasks.data?.length ?? 0}
              href={pageHref('team', { tab: 'mine' })}
            />
          }
        />
      ) : null}

      <QueryTable
        table="provider-calls-inbox-requests"
        hasPagination={false}
        title={translate('Calls waiting for your answer')}
        query={top(waiting)}
        columns={getRequestColumns()}
        emptyMessage={translate('No call is waiting for an answer.')}
        footer={
          <More total={waiting.data?.length ?? 0} href={pageHref('requests')} />
        }
      />

      <QueryTable
        table="provider-calls-inbox-awards"
        hasPagination={false}
        title={translate('Awards waiting for your approval')}
        query={top(awards)}
        columns={getAwardColumns(providerUuid)}
        emptyMessage={translate('No award is waiting for your approval.')}
        footer={
          <More total={awards.data?.length ?? 0} href={pageHref('awards')} />
        }
      />

      <QueryTable
        table="provider-calls-inbox-slots"
        hasPagination={false}
        title={translate('Team slots due soonest')}
        query={top(slots)}
        columns={getSlotColumns()}
        emptyMessage={translate('Your team has no open assessments.')}
        footer={
          <More total={slots.data?.length ?? 0} href={pageHref('team')} />
        }
      />
    </div>
  );
};
