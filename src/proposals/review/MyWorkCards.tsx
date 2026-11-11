import {
  HourglassMediumIcon,
  ListChecksIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { MyTaskDueEnum } from 'waldur-js-client';

import { translate } from '@/i18n';
import { MyTaskDueOptions } from '@/table/generated/ProposalMyTasksFilter';
import { useFilteredNavigation } from '@/table/useFilteredNavigation';
import { DashboardCard } from '@/user/dashboard/DashboardCard';

import { MY_TASKS_TABLE } from './myTasksTable';
import { useMyTasksSummary } from './useMyTasksCount';

interface Card {
  key: string;
  count: number;
  title: string;
  message: string;
  icon: ReactNode;
  backgroundColor: string;
  due: MyTaskDueEnum | null;
}

/**
 * The user's workflow tasks on the dashboard: how many wait, how many are
 * overdue and how many are due soon. Each card opens My tasks on exactly the
 * tasks it counts. A count of nothing is left out, and with no tasks at all
 * the band is not shown.
 */
export const MyWorkCards: FC = () => {
  const summary = useMyTasksSummary();
  const goToFiltered = useFilteredNavigation();

  if (!summary?.total) {
    return null;
  }

  const cards: Card[] = [
    {
      key: 'total',
      count: summary.total,
      title: translate('Tasks waiting for you'),
      message:
        summary.total === 1
          ? translate('1 open task across calls')
          : translate('{count} open tasks across calls', {
              count: summary.total,
            }),
      icon: (
        <ListChecksIcon
          size={32}
          className="text-[var(--fg-white)]"
          weight="bold"
        />
      ),
      backgroundColor: 'bg-info-600',
      due: null,
    },
    {
      key: 'overdue',
      count: summary.overdue,
      title: translate('Overdue tasks'),
      message: translate('{count} tasks are past their deadline', {
        count: summary.overdue,
      }),
      icon: (
        <WarningCircleIcon
          size={32}
          className="text-[var(--fg-white)]"
          weight="bold"
        />
      ),
      backgroundColor: 'bg-danger',
      due: 'overdue',
    },
    {
      key: 'due_soon',
      count: summary.due_soon,
      title: translate('Tasks due soon'),
      message: translate('{count} tasks are due within {days} days', {
        count: summary.due_soon,
        days: summary.due_soon_days,
      }),
      icon: (
        <HourglassMediumIcon
          size={32}
          className="text-[var(--fg-white)]"
          weight="bold"
        />
      ),
      backgroundColor: 'bg-warning',
      due: 'due_soon',
    },
  ].filter((card) => card.count > 0) as Card[];

  return (
    <div
      className="grid grid-cols-1 gap-x-5 gap-y-3 mb-4 md:grid-cols-3"
      data-testid="my-work-cards"
    >
      {cards.map((card) => (
        <div key={card.key}>
          <DashboardCard
            title={card.title}
            message={card.message}
            icon={card.icon}
            isLoading={false}
            hasItems
            backgroundColor={card.backgroundColor}
            onClick={() =>
              goToFiltered('reviews-tasks', MY_TASKS_TABLE, {
                due:
                  MyTaskDueOptions.find(
                    (option) => option.value === card.due,
                  ) ?? null,
              })
            }
          />
        </div>
      ))}
    </div>
  );
};
