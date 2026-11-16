import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { StartableStepDiscussion } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { discussionTarget } from './discussionAction';
import { DiscussionPlace } from './DiscussionPlace';
import { useStartableDiscussions } from './queries';
import { useOpenStepDiscussion } from './StepDiscussionButton';

type Row = StartableStepDiscussion & { key: string };

const StartButton: FC<{ row: Row; onStarted?(): void }> = ({
  row,
  onStarted,
}) => {
  const open = useOpenStepDiscussion({ refetch: onStarted });
  return (
    <BaseButton
      variant="primary"
      size="sm"
      iconNode={<PlusCircleIcon weight="bold" />}
      label={translate('Start discussion')}
      pending={open.isPending}
      onClick={() => open.mutate(discussionTarget(row))}
      data-testid="startable-discussion-start"
    />
  );
};

/**
 * The discussions nobody has started that the viewer could start now: of
 * the steps they work on, and of their panels' round steps. Nothing while
 * there are none.
 */
export const StartableDiscussions: FC<{
  chatEnabled: boolean;
  /** Reloads the started discussions, once one is started from here. */
  onStarted?(): void;
}> = ({ chatEnabled, onStarted }) => {
  const user = useUser();
  const { data } = useStartableDiscussions(user?.uuid, chatEnabled);
  const rows = useMemo<Row[]>(
    () =>
      (data ?? []).map((row) => ({
        ...row,
        key: `${row.proposal_step_uuid ?? row.round_step_uuid}-${row.panel_uuid ?? ''}`,
      })),
    [data],
  );
  const columns = useMemo<Column<Row>[]>(
    () => [
      {
        title: translate('Call'),
        render: ({ row }) => <span>{row.call_name}</span>,
      },
      {
        title: translate('Step'),
        render: ({ row }) => (
          <span className="font-medium text-primary">{row.step_name}</span>
        ),
      },
      {
        title: translate('Proposal or round'),
        render: ({ row }) => <DiscussionPlace {...row} />,
      },
      {
        title: translate('Due'),
        render: ({ row }) => (
          <>{renderFieldOrDash(row.due_at ? formatDate(row.due_at) : null)}</>
        ),
      },
      {
        title: '',
        render: ({ row }) => (
          <div className="flex justify-end">
            <StartButton row={row} onStarted={onStarted} />
          </div>
        ),
      },
    ],
    [onStarted],
  );
  if (!rows.length) return null;
  return (
    <section
      className="mb-4 rounded-lg border border-brand-subtle bg-brand-subtle p-4 font-normal"
      data-testid="startable-discussions"
    >
      <h3 className="text-base font-semibold text-primary">
        {translate('Ready to start')}
      </h3>
      <p className="mb-3 text-sm text-tertiary">
        {translate(
          'Steps you work on have a discussion nobody has started yet. Starting one creates its room and invites everyone taking part.',
        )}
      </p>
      <SimpleTable<Row> columns={columns} rows={rows} rowKey="key" />
    </section>
  );
};
