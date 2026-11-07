import { FC } from 'react';
import { CallPanel, proposalProtectedCallsPanelsList } from 'waldur-js-client';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { getCallReadOnlyReason } from '@/proposals/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../../types';

import { CallPanelDeleteAction, CallPanelEditAction } from './CallPanelActions';
import { formatPanelDomains } from './utils';

const CallPanelFormDialog = lazyComponent(() =>
  import('./CallPanelFormDialog').then((module) => ({
    default: module.CallPanelFormDialog,
  })),
);

interface CallPanelsSectionProps {
  call: Call;
  isReadOnly?: boolean;
}

/**
 * The panels of a call, such as the Domain Panels of Regular Access. A
 * proposal goes to the panel covering its science domain when its evaluation
 * starts, and evaluator roles for the proposal's panel are held by that
 * panel's chair or members.
 */
export const CallPanelsSection: FC<CallPanelsSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const tableProps = useTable({
    table: 'CallPanels',
    fetchData: createFetcher(proposalProtectedCallsPanelsList, {
      path: { uuid: call.uuid },
    }),
  });

  const columns: Column<CallPanel>[] = [
    {
      title: translate('Panel'),
      render: ({ row }) => (
        <span className="font-medium text-primary">{row.name}</span>
      ),
    },
    {
      title: translate('Domains'),
      render: ({ row }) => renderFieldOrDash(formatPanelDomains(row)),
    },
    {
      title: translate('Chair'),
      render: ({ row }) => renderFieldOrDash(row.chair_name),
    },
    {
      title: translate('Members'),
      render: ({ row }) => row.member_details.length,
    },
    {
      title: translate('Proposals'),
      render: ({ row }) => row.proposals_count,
    },
  ];

  return (
    <Table<CallPanel>
      {...tableProps}
      columns={columns}
      title={translate('Panels')}
      verboseName={translate('panels')}
      tableActions={
        <CreateModalButton
          dialog={CallPanelFormDialog}
          resolve={{ call, refetch: tableProps.fetch }}
          size="lg"
          disabled={isReadOnly}
          tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        />
      }
      rowActions={({ row, fetch }) =>
        isReadOnly ? (
          <ActionsDropdown disabled tooltip={getCallReadOnlyReason(call)} />
        ) : (
          <ActionsDropdown
            row={row}
            refetch={fetch}
            actions={[
              ({ row, refetch }) => (
                <CallPanelEditAction row={row} call={call} refetch={refetch} />
              ),
              ({ row, refetch }) => (
                <CallPanelDeleteAction
                  row={row}
                  call={call}
                  refetch={refetch}
                />
              ),
            ]}
          />
        )
      }
    />
  );
};
