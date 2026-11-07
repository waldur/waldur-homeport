import { FC, useMemo } from 'react';
import {
  CallProposalRole,
  proposalProtectedCallsProposalRolesList,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

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

import {
  eligibilityLabel,
  holdersLabel,
  isRoleUsed,
  rolesUsedBySteps,
} from '../../proposal-roles/constants';
import { useCallStepsNamingRoles } from '../../proposal-roles/queries';
import { StaffingWarning } from '../../proposal-roles/StaffingWarning';
import { Call } from '../../types';

import {
  ProposalRoleDeleteAction,
  ProposalRoleEditAction,
} from './ProposalRoleActions';

const ProposalRoleFormDialog = lazyComponent(() =>
  import('./ProposalRoleFormDialog').then((module) => ({
    default: module.ProposalRoleFormDialog,
  })),
);

interface CallProposalRolesSectionProps {
  call: Call;
  isReadOnly?: boolean;
}

/**
 * The evaluator roles a call gives on each of its proposals, such as a lead
 * and a second rapporteur. An assignment step picks their holders; a step
 * can also be completed by the holders of one.
 */
export const CallProposalRolesSection: FC<CallProposalRolesSectionProps> = ({
  call,
  isReadOnly,
}) => {
  const tableProps = useTable({
    table: 'CallProposalRoles',
    fetchData: createFetcher(proposalProtectedCallsProposalRolesList, {
      path: { uuid: call.uuid },
    }),
  });

  // A role no enabled step assigns or works with asks nobody for holders.
  const { data: steps } = useCallStepsNamingRoles(call.uuid);
  const used = useMemo(() => (steps ? rolesUsedBySteps(steps) : null), [steps]);

  const columns: Column<CallProposalRole>[] = [
    {
      title: translate('Role'),
      render: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-primary">{row.name}</span>
          {row.allows_lead && (
            <Badge variant="primary" size="sm" shape="pill" tone="outline">
              {translate('Has a lead')}
            </Badge>
          )}
          {used && !isRoleUsed(used, row) && (
            <Badge
              variant="warning"
              size="sm"
              shape="pill"
              tone="outline"
              title={translate(
                'No enabled step assigns this role or is worked on by its holders, so proposals do not ask for them. Name it in a step, or delete it.',
              )}
            >
              {translate('Not used by any enabled step')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: translate('Staffing'),
      render: ({ row }) =>
        row.holders_warning ? (
          <StaffingWarning warning={row.holders_warning} />
        ) : row.eligible_count === null || row.eligible_count === undefined ? (
          renderFieldOrDash(null)
        ) : (
          translate('{count} may hold it', { count: row.eligible_count })
        ),
    },
    {
      title: translate('Who may hold it'),
      render: ({ row }) => eligibilityLabel(row.eligible_from),
    },
    {
      title: translate('Holders per proposal'),
      render: ({ row }) => holdersLabel(row),
    },
    {
      title: translate('Description'),
      render: ({ row }) =>
        row.description ? (
          <span className="text-quaternary">{row.description}</span>
        ) : (
          renderFieldOrDash(null)
        ),
    },
  ];

  return (
    <Table<CallProposalRole>
      {...tableProps}
      columns={columns}
      title={translate('Evaluator roles')}
      verboseName={translate('evaluator roles')}
      tableActions={
        <CreateModalButton
          dialog={ProposalRoleFormDialog}
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
                <ProposalRoleEditAction
                  row={row}
                  call={call}
                  refetch={refetch}
                />
              ),
              ({ row, refetch }) => (
                <ProposalRoleDeleteAction
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
