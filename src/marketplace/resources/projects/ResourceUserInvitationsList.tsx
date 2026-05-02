import { XCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Invitation,
  Resource,
  userInvitationsCancel,
  userInvitationsList,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { getInvitationColumns } from '@/invitations/columns';
import { InvitationExpandableRow } from '@/invitations/InvitationExpandableRow';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
} from '@/table/generated/UserInvitationsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ResourcePermissionsLogButton } from '../users/ResourcePermissionsLogButton';
import { ResourceTeamAddDropdown } from '../users/ResourceTeamAddDropdown';

const CancelInvitationAction: FC<{
  row: Invitation;
  refetch(): void;
}> = ({ row, refetch }) => {
  const dispatch = useDispatch();

  const handler = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Cancel invitation for {email}?',
          { email: <b>{row.email}</b> },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await userInvitationsCancel({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Invitation canceled.')));
      await refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to cancel invitation.')),
      );
    }
  }, [dispatch, row, refetch]);

  if (row.state !== 'pending') return null;

  return (
    <ActionItem
      title={translate('Cancel')}
      action={handler}
      iconNode={<XCircleIcon weight="bold" />}
      className="text-danger"
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
}

export const ResourceUserInvitationsList: FC<ResourceInvitationsListProps> = ({
  resource,
  offering,
  tableTabs,
  title,
  scopeUuid,
  scopeUrl,
  scopeLabel,
  contentType,
}) => {
  const stateFilter = useSelector(selectUserInvitationsFilter);

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
    />
  );
};
