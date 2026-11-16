import { FC, useMemo, useState } from 'react';
import { StepDiscussion, proposalStepDiscussionsList } from 'waldur-js-client';

import { Switch } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { MyReviewsLayout } from '@/proposals/review/MyReviewsLayout';
import { useMyWorkTitle } from '@/proposals/review/myWorkTitle';
import { useMyReviewsTabs } from '@/proposals/review/tabs';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableNav } from '@/table/TableNav';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import {
  discussionStateLabel,
  discussionStateVariant,
} from './discussionAction';
import { DiscussionPlace } from './DiscussionPlace';
import { DiscussionRowActions } from './DiscussionRowActions';
import { useStartableDiscussions } from './queries';
import { StartableDiscussions } from './StartableDiscussions';

/**
 * The discussions the user takes part in, open ones first of all: a step's
 * room for the people working on it, from their proposals or rounds.
 */
export const MyDiscussionsPage: FC = () => {
  const myWorkTitle = useMyWorkTitle();
  const tabs = useMyReviewsTabs();
  const [includeClosed, setIncludeClosed] = useState(false);
  const chatEnabled = isMatrixChatEnabled();
  const user = useUser();
  const { data: startable } = useStartableDiscussions(user?.uuid, chatEnabled);

  const filter = useMemo(
    () => (includeClosed ? { mine: true } : { mine: true, state: 'open' }),
    [includeClosed],
  );
  const tableProps = useTable({
    table: 'MyStepDiscussions',
    fetchData: createFetcher(proposalStepDiscussionsList),
    filter,
  });

  const columns = useMemo<Column<StepDiscussion>[]>(
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
        title: translate('Opened'),
        render: ({ row }) => (
          <>{renderFieldOrDash(formatDateTime(row.opened_at))}</>
        ),
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
    <MyReviewsLayout>
      <Table<StepDiscussion>
        {...tableProps}
        columns={columns}
        title={myWorkTitle}
        nav={
          <>
            {tabs.length ? <TableNav tabs={tabs} /> : null}
            <StartableDiscussions
              chatEnabled={chatEnabled}
              onStarted={tableProps.fetch}
            />
          </>
        }
        verboseName={translate('discussions')}
        emptyMessage={
          includeClosed
            ? translate('You have taken part in no discussion.')
            : startable?.length
              ? translate('No discussion has been started yet.')
              : translate(
                  'You take part in no open discussion. Discussions appear here when a step you work on has one.',
                )
        }
        tableActions={
          <Switch
            checked={includeClosed}
            onCheckedChange={setIncludeClosed}
            label={translate('Include closed')}
          />
        }
        rowActions={({ row }) => (
          <DiscussionRowActions row={row} refetch={tableProps.fetch} />
        )}
      />
    </MyReviewsLayout>
  );
};
