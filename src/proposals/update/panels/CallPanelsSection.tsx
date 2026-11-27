import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { CallPanel, proposalProtectedCallsPanelsList } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { usePanelExport } from '@/proposals/manage/usePanelExport';
import { canExportCall, getCallReadOnlyReason } from '@/proposals/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { Call } from '../../types';

import { CallPanelDeleteAction, CallPanelEditAction } from './CallPanelActions';
import { PanelExportActions } from './PanelExportActions';
import { formatPanelDomains, getPanelRowActions } from './utils';

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
  const download = usePanelExport(call);
  // The exports are the call team's: an organisation owner without
  // CALL.UPDATE reads the panels but would be refused the files.
  const canExport = canExportCall(useUser(), call);
  const rowActions = getPanelRowActions({ canExport, isReadOnly });
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
        <>
          {rowActions.includes('export') && (
            <BaseButton
              label={translate('All panel sheets (Excel)')}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              onClick={() => download('export-panel-sheet', 'xlsx')}
              variant="tertiary"
              size="sm"
              disabled={!tableProps.rows?.length}
              tooltip={
                tableProps.rows?.length
                  ? translate('One workbook, with a sheet per panel.')
                  : translate('The call has no panels yet.')
              }
            />
          )}
          <CreateModalButton
            dialog={CallPanelFormDialog}
            resolve={{ call, refetch: tableProps.fetch }}
            size="lg"
            disabled={isReadOnly}
            tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
          />
        </>
      }
      rowActions={({ row, fetch }) =>
        !rowActions.length ? (
          <ActionsDropdown disabled tooltip={getCallReadOnlyReason(call)} />
        ) : (
          // The sheets stay downloadable on a call that can no longer change.
          <ActionsDropdown
            row={row}
            refetch={fetch}
            actions={[
              ...(canExport
                ? [({ row }) => <PanelExportActions call={call} panel={row} />]
                : []),
              ...(isReadOnly
                ? []
                : [
                    ({ row, refetch }) => (
                      <CallPanelEditAction
                        row={row}
                        call={call}
                        refetch={refetch}
                      />
                    ),
                    ({ row, refetch }) => (
                      <CallPanelDeleteAction
                        row={row}
                        call={call}
                        refetch={refetch}
                      />
                    ),
                  ]),
            ]}
          />
        )
      }
    />
  );
};
