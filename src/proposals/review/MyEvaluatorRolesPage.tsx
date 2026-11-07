import { ShieldCheckIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  ProposalRoleAssignment,
  proposalRoleAssignmentsConfirmNoConflict,
  proposalRoleAssignmentsList,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { CoiDeclaration } from '../coi-declaration/CoiDeclaration';
import { coiStateLabel } from '../proposal-roles/constants';

import { useMyWorkTitle } from './myWorkTitle';
import { useMyReviewsTabs } from './tabs';

const ConfirmNoConflictAction: FC<{
  row: ProposalRoleAssignment;
  refetch(): void;
}> = ({ row, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalRoleAssignmentsConfirmNoConflict({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Confirm no conflict of interest'),
      body: (
        <CoiDeclaration
          text={row.coi_declaration_text}
          fallback={translate(
            'I confirm that I have no conflict of interest with the proposal {proposal}: no personal, professional or financial tie to its applicants that could bias my evaluation.',
            { proposal: row.proposal_name },
          )}
        />
      ),
    },
    successMessage: translate('Thank you. The proposal is now open to you.'),
    errorMessage: translate('Unable to confirm.'),
    invalidateQueries: [{ queryKey: ['my-evaluator-roles-count'] }],
  });
  return (
    <ActionItem
      title={translate('Confirm no conflict of interest')}
      action={() => mutate()}
      disabled={isPending}
      iconNode={<ShieldCheckIcon weight="bold" />}
    />
  );
};

/**
 * The evaluator roles the user holds on proposals -- as a rapporteur, say --
 * and the way to them. A role that asks for it opens its proposal only once
 * the holder has confirmed having no conflict of interest.
 */
export const MyEvaluatorRolesPage: FC = () => {
  const myWorkTitle = useMyWorkTitle();
  const tabs = useMyReviewsTabs();
  const user = useUser();

  const filter = useMemo(
    () => ({ user_uuid: user?.uuid, is_active: true }),
    [user?.uuid],
  );

  const tableProps = useTable({
    table: 'MyEvaluatorRoles',
    fetchData: createFetcher(proposalRoleAssignmentsList),
    filter,
  });

  const columns: Column<ProposalRoleAssignment>[] = [
    {
      title: translate('Proposal'),
      render: ({ row }) =>
        row.awaits_coi_confirmation ? (
          <span className="font-medium text-primary">{row.proposal_name}</span>
        ) : (
          <Link
            state="proposals.manage-proposal"
            params={{ proposal_uuid: row.proposal_uuid }}
            label={row.proposal_name}
          />
        ),
    },
    {
      title: translate('Call'),
      render: ({ row }) => <span>{row.call_name}</span>,
    },
    {
      title: translate('Role'),
      render: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span>{row.role_name}</span>
          {row.is_lead && (
            <Badge variant="primary" size="sm" shape="pill" tone="outline">
              {translate('Lead')}
            </Badge>
          )}
        </div>
      ),
    },
    {
      title: translate('Conflict of interest'),
      render: ({ row }) =>
        row.awaits_coi_confirmation ? (
          <Badge variant="warning" size="sm" shape="pill" tone="outline">
            {coiStateLabel(row)}
          </Badge>
        ) : (
          <span className="text-quaternary">{coiStateLabel(row)}</span>
        ),
    },
    {
      title: translate('Assigned'),
      render: ({ row }) => <span>{formatDate(row.created)}</span>,
    },
  ];

  return (
    <Table<ProposalRoleAssignment>
      {...tableProps}
      columns={columns}
      title={myWorkTitle}
      tabs={tabs}
      verboseName={translate('evaluator roles')}
      rowActions={({ row, fetch }) =>
        row.awaits_coi_confirmation ? (
          <ActionsDropdown
            row={row}
            refetch={fetch}
            actions={[
              ({ row, refetch }) => (
                <ConfirmNoConflictAction row={row} refetch={refetch} />
              ),
            ]}
          />
        ) : null
      }
    />
  );
};
