import { FC, useCallback, useMemo } from 'react';
import {
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { createClientPaginatedFetcher, createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { RoundExpandableRow } from '../update/rounds/RoundExpandableRow';
import { RoundLifecycleBadge } from '../update/rounds/RoundLifecycleBadge';
import { getRoundStatus, getRoundsWithStatus, isOnCallTeam } from '../utils';

interface CallRoundsListProps {
  call: Call;
}

/**
 * The public call carries its rounds without their adoption record. The call
 * team reads the rounds from the protected endpoint instead, so a reviewer or
 * panel member sees the same results and adoption as the managers do; should
 * that read be refused, they get the public rounds like everyone else.
 */
const useRoundsFetcher = (call: Call, onCallTeam: boolean) =>
  useMemo(() => {
    const publicFetcher = createClientPaginatedFetcher(
      getRoundsWithStatus(call.rounds),
    );
    if (!onCallTeam) {
      return publicFetcher;
    }
    const teamFetcher = createFetcher(proposalProtectedCallsRoundsList, {
      path: { uuid: call.uuid },
    });
    return async (request) => {
      try {
        const page = await teamFetcher(request);
        return {
          ...page,
          rows: page.rows.map((round) => ({
            ...round,
            status: getRoundStatus(round),
          })),
        };
      } catch (error) {
        // Refused (or not found) is the one expected answer; anything else
        // is a real failure the table reports rather than masks.
        const status = error?.status ?? error?.response?.status;
        if (status === 403 || status === 404) {
          return publicFetcher(request);
        }
        throw error;
      }
    };
  }, [call.uuid, call.rounds, onCallTeam]);

export const CallRoundsList: FC<CallRoundsListProps> = (props) => {
  const user = useUser();
  const onCallTeam = isOnCallTeam(user, props.call);
  const ExpandableRow = useCallback(
    ({ row }: { row: ProtectedRound }) => (
      <RoundExpandableRow row={row} call={props.call} />
    ),
    [props.call],
  );
  const tableProps = useTable({
    table: onCallTeam ? 'PublicCallRoundsListTeam' : 'PublicCallRoundsList',
    fetchData: useRoundsFetcher(props.call, onCallTeam),
  });

  return (
    <Table
      {...tableProps}
      id="rounds"
      columns={[
        {
          title: translate('Round ID'),
          render: ({ row }) => row.slug,
          copyField: (row) => row.slug,
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{formatDateTime(row.start_time)}</>,
        },
        {
          title: translate('Cutoff date'),
          render: ({ row }) => <>{formatDateTime(row.cutoff_time)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <div className="d-flex flex-wrap gap-2">
              <StateIndicator
                label={row.status.label}
                variant={row.status.color}
                tone="outline"
                shape="pill"
              />
              <RoundLifecycleBadge
                state={row.lifecycle_state}
                heldDecisionsCount={row.held_decisions_count}
              />
            </div>
          ),
        },
      ]}
      title={translate('Rounds')}
      verboseName={translate('Rounds')}
      expandableRow={ExpandableRow}
    />
  );
};
