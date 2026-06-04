import { XCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  Invitation,
  Resource,
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
import { useTable } from '@/table/useTable';

import { ResourcePermissionsLogButton } from '../users/ResourcePermissionsLogButton';
import { ResourceTeamAddDropdown } from '../users/ResourceTeamAddDropdown';

const CancelInvitationAction: FC<{
  row: Invitation;
  refetch(): void;
}> = ({ row, refetch }) => {
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

interface ResourceInvitationsListProps {
  resource: Resource;
  offering?;
  tableTabs?: any[];
  title?: string;
  /**
   * Override scope when listing invitations for a specific
   * ResourceProject (instead of the parent Resource). When omitted,
   * defaults to the parent Resource's uuid/url/name and uses the
   * `resource` content type.
   */
  scopeUuid?: string;
  scopeUrl?: string;
  scopeLabel?: string;
  contentType?: 'resource' | 'resource_project';
  hasActionBar?: boolean;
}

const ResourceUserInvitationsListTable: FC<ResourceInvitationsListProps> = ({
  resource,
  offering,
  tableTabs,
  title,
  scopeUuid,
  scopeUrl,
  scopeLabel,
  contentType,
  hasActionBar,
}) => {
  const { values } = useFormState();

  const stateFilter = useMemo(
    () => selectUserInvitationsFilter(values),
    [values],
  );

  const effectiveScopeUuid = scopeUuid ?? resource.uuid;
  const effectiveScopeUrl = scopeUrl ?? resource.url;
  const effectiveScopeLabel = scopeLabel ?? resource.name;
  const effectiveContentType = contentType ?? 'resource';

  const filter = useMemo(
    () => ({
      ...stateFilter,
      // Backend filter is `?scope=<scope-url>` (handled by
      // InvitationScopeFilterBackend → GenericKeyFilterBackend), NOT
      // `?scope_uuid=` which the API silently ignores.
      scope: effectiveScopeUrl,
    }),
    [stateFilter, effectiveScopeUrl],
  );

  const tableProps = useTable({
    // Include scope uuid in the table key so multiple instances (e.g.
    // several expanded ResourceProject rows) keep independent
    // pagination, sort and filter state.
    table: `resource-invitations-${effectiveScopeUuid}`,
    fetchData: createFetcher(userInvitationsList),
    filter,
    queryField: 'email',
  });

  return (
    <Table<Invitation>
      {...tableProps}
      title={title ?? translate('Invitations')}
      tabs={tableTabs}
      hasActionBar={hasActionBar}
      verboseName={translate('resource invitations')}
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
        <ResourceTeamAddDropdown
          scope={effectiveContentType}
          scopeUuid={effectiveScopeUuid}
          scopeUrl={effectiveScopeUrl}
          scopeLabel={effectiveScopeLabel}
          projectUuid={resource.project_uuid}
          customerUuid={resource.customer_uuid}
          offering={offering}
          showAssign={false}
          refetch={tableProps.fetch}
        />
      }
      dropdownActions={
        <ResourcePermissionsLogButton scopeUrl={effectiveScopeUrl} />
      }
      enableExport
      showExportInDropdown
      formId={UserInvitationsFilterFormId}
    />
  );
};

export const ResourceUserInvitationsList: FC<any> = (props) => (
  <Form
    id={UserInvitationsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <ResourceUserInvitationsListTable {...props} />}
  </Form>
);
