import { FC, useMemo, useState } from 'react';
import { StepDiscussion, proposalStepDiscussionsList } from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import {
  discussionStateLabel,
  discussionStateVariant,
} from '@/proposals/discussions/discussionAction';
import { DiscussionPlace } from '@/proposals/discussions/DiscussionPlace';
import { DiscussionRowActions } from '@/proposals/discussions/DiscussionRowActions';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../types';

interface CallDiscussionsListProps {
  call: Call;
}

/**
 * Every discussion of the call, for those who oversee it: whoever may update
 * the call reads them all, open and closed, whether or not they take part.
 * The backend leaves out any they are kept away from, a proposal they apply
 * with or have a conflict of interest on.
 */
export const CallDiscussionsList: FC<CallDiscussionsListProps> = ({ call }) => {
  const [onlyOpen, setOnlyOpen] = useState(false);
  const filter = useMemo(
    () =>
      onlyOpen
        ? { call_uuid: call.uuid, state: 'open' }
        : { call_uuid: call.uuid },
    [call.uuid, onlyOpen],
  );
  const tableProps = useTable({
    table: `call-discussions-${call.uuid}`,
    fetchData: createFetcher(proposalStepDiscussionsList),
    filter,
  });

  const columns = useMemo<Column<StepDiscussion>[]>(
    () => [
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
        title: translate('Opened'),
        render: ({ row }) => (
          <div className="flex flex-col">
            <span>{renderFieldOrDash(formatDateTime(row.opened_at))}</span>
            {row.opened_by_name ? (
              <span className="text-sm text-tertiary">
                {translate('by {name}', { name: row.opened_by_name })}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        title: translate('Closed'),
        render: ({ row }) => (
          <>
            {renderFieldOrDash(row.closed_at && formatDateTime(row.closed_at))}
          </>
        ),
      },
      {
        title: translate('Taking part'),
        render: ({ row }) => <>{row.participants.length}</>,
      },
      {
        title: translate('State'),
        render: ({ row }) => (
          <StateIndicator
            label={discussionStateLabel(row.state)}
            variant={discussionStateVariant(row.state)}
            tone="outline"
            shape="pill"
          />
        ),
      },
    ],
    [],
  );

  return (
    <Table<StepDiscussion>
      {...tableProps}
      columns={columns}
      title={translate('Discussions')}
      verboseName={translate('discussions')}
      emptyMessage={
        onlyOpen
          ? translate('No discussion of this call is open.')
          : translate(
              'No discussion of this call has been started. A step with a discussion gets one when someone working on it starts it.',
            )
      }
      tableActions={
        <Switch
          checked={onlyOpen}
          onCheckedChange={setOnlyOpen}
          label={translate('Only open')}
        />
      }
      rowActions={({ row }) => (
        <DiscussionRowActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
