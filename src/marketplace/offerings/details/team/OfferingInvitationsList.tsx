import { XCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  Invitation,
  ProviderOfferingDetails as Offering,
  userInvitationsCancel,
  userInvitationsList,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { getInvitationColumns } from '@/invitations/columns';
import { InvitationExpandableRow } from '@/invitations/InvitationExpandableRow';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
  UserInvitationsFilterFormId,
} from '@/table/generated/UserInvitationsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { OfferingPermissionLogButton } from './OfferingPermissionLogButton';
import { OfferingTeamAddDropdown } from './OfferingTeamAddDropdown';

const CancelInvitationAction: FC<{ row: Invitation; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const cancelMutation = useManagedMutation<any, any, void>({
    mutationFn: () => userInvitationsCancel({ path: { uuid: row.uuid } }),
    successMessage: translate('Invitation canceled.'),
    errorMessage: translate('Unable to cancel invitation.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Cancel invitation for {email}?',
        { email: <b>{row.email}</b> },
        formatJsxTemplate,
      ),
    },
  });

  const tooltip =
    row.state === 'canceled'
      ? translate('This invitation has already been canceled.')
      : row.state === 'expired'
        ? translate('This invitation has expired.')
        : row.state !== 'pending'
          ? translate('Only pending invitations can be canceled.')
          : undefined;

  return (
    <ActionItem
      title={translate('Cancel')}
      action={() => cancelMutation.mutate()}
      iconNode={<XCircleIcon weight="bold" />}
      className="text-danger"
      disabled={row.state !== 'pending' || cancelMutation.isPending}
      tooltip={tooltip}
    />
  );
};

interface OfferingInvitationsListProps {
  offering: Offering;
  tableTabs?: any[];
  title?: string;
}

/** Pending and past email invitations scoped to an offering. */
export const OfferingInvitationsList: FC<OfferingInvitationsListProps> = ({
  offering,
  tableTabs,
  title,
}) => {
  const values = useFilterValues(`offering-invitations-${offering.uuid}`);

  const stateFilter = useMemo(
    () => selectUserInvitationsFilter(values),
    [values],
  );

  const filter = useMemo(
    () => ({
      ...stateFilter,
      // Backend filter is `?scope=<scope-url>` (InvitationScopeFilterBackend →
      // GenericKeyFilterBackend), NOT `?scope_uuid=`, which the API ignores.
      scope: offering.url,
    }),
    [stateFilter, offering.url],
  );

  const tableProps = useTable({
    table: `offering-invitations-${offering.uuid}`,
    syncFiltersToURL: true,
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });

  return (
    <Table<Invitation>
      {...tableProps}
      title={title ?? translate('Team')}
      tabs={tableTabs}
      verboseName={translate('offering invitations')}
      hasQuery={true}
      filters={<UserInvitationsFilter />}
      columns={getInvitationColumns()}
      expandableRow={InvitationExpandableRow}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <CancelInvitationAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={
        <OfferingTeamAddDropdown
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
      dropdownActions={<OfferingPermissionLogButton offering={offering} />}
      enableExport
      showExportInDropdown
      formId={UserInvitationsFilterFormId}
    />
  );
};
