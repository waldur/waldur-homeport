import {
  ArrowsClockwiseIcon,
  CloudArrowDownIcon,
  LinkBreakIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  OfferingKeycloakGroup,
  offeringKeycloakGroupsDestroy,
  offeringKeycloakGroupsList,
  offeringKeycloakGroupsPullMembers,
  offeringKeycloakGroupsSetBackendId,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatJsxTemplate, translate } from '@/i18n';
import { openModalDialog, waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../update/types';

import { ImportRemoteGroupDialog } from './ImportRemoteGroupDialog';
import { KeycloakGroupExpandableRow } from './KeycloakGroupExpandableRow';
import { RemapGroupDialog } from './RemapGroupDialog';

const RemapAction = ({
  row,
  refetch,
  offering_uuid,
}: {
  row: OfferingKeycloakGroup;
  refetch;
  offering_uuid: string;
}) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Remap')}
      action={() =>
        dispatch(
          openModalDialog(RemapGroupDialog, {
            resolve: { group: row, offering_uuid, refetch },
          }),
        )
      }
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};

const PullMembersAction = ({
  row,
  refetch,
}: {
  row: OfferingKeycloakGroup;
  refetch;
}) => {
  const dispatch = useDispatch();
  const [pending, setPending] = useState(false);
  if (!row.backend_id) return null;
  const pull = async () => {
    setPending(true);
    try {
      const response = await offeringKeycloakGroupsPullMembers({
        path: { uuid: row.uuid },
      });
      const { created, updated, total_remote } = response.data;
      dispatch(
        showSuccess(
          translate(
            'Synced {total_remote} members ({created} new, {updated} updated).',
            { total_remote, created, updated },
          ),
        ),
      );
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to sync members.')));
    } finally {
      setPending(false);
    }
  };
  return (
    <ActionItem
      title={pending ? translate('Syncing...') : translate('Sync members')}
      action={pull}
      disabled={pending}
      iconNode={<CloudArrowDownIcon weight="bold" />}
    />
  );
};

const UnlinkAction = ({
  row,
  refetch,
}: {
  row: OfferingKeycloakGroup;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to unlink {name} from its remote Keycloak group?',
          {
            name: <strong>{row.name}</strong>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await offeringKeycloakGroupsSetBackendId({
        path: { uuid: row.uuid },
        body: { backend_id: null },
      });
      dispatch(showSuccess(translate('Group has been unlinked.')));
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to unlink group.')));
    }
  };
  if (!row.backend_id) return null;
  return (
    <ActionItem
      title={translate('Unlink')}
      action={openDialog}
      iconNode={<LinkBreakIcon weight="bold" />}
      className="text-warning"
      iconColor="warning"
    />
  );
};

const DeleteGroupAction = ({
  row,
  refetch,
}: {
  row: OfferingKeycloakGroup;
  refetch;
}) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete group {name}? This will also remove it from Keycloak if synced.',
          {
            name: <strong>{row.name}</strong>,
          },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await offeringKeycloakGroupsDestroy({ path: { uuid: row.uuid } });
      dispatch(showSuccess(translate('Group has been deleted.')));
      refetch();
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to delete group.')));
    }
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};

export const KeycloakGroupsSection: FC<OfferingSectionProps> = (props) => {
  const dispatch = useDispatch();
  const filter = useMemo(
    () => ({ offering_uuid: props.offering.uuid }),
    [props.offering.uuid],
  );
  const tableProps = useTable({
    table: 'OfferingKeycloakGroupsList',
    fetchData: createFetcher(offeringKeycloakGroupsList),
    filter,
  });

  return (
    <Table
      {...tableProps}
      title={translate('Keycloak groups')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Role'),
          render: ({ row }) => row.role_name,
        },
        {
          title: translate('Resource'),
          render: ({ row }) => renderFieldOrDash(row.resource_name),
        },
        {
          title: translate('Status'),
          render: ({ row }) =>
            row.backend_id ? (
              <Badge variant="success" outline>
                {translate('Synced')}
              </Badge>
            ) : (
              <Badge variant="warning" outline>
                {translate('Not synced')}
              </Badge>
            ),
        },
      ]}
      verboseName={translate('groups')}
      hasQuery={false}
      expandableRow={KeycloakGroupExpandableRow}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <PullMembersAction row={row} refetch={tableProps.fetch} />
          <RemapAction
            row={row}
            refetch={tableProps.fetch}
            offering_uuid={props.offering.uuid}
          />
          <UnlinkAction row={row} refetch={tableProps.fetch} />
          <DeleteGroupAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={
        <ActionButton
          title={translate('Import remote group')}
          action={() =>
            dispatch(
              openModalDialog(ImportRemoteGroupDialog, {
                resolve: {
                  offering: props.offering,
                  refetch: tableProps.fetch,
                },
              }),
            )
          }
          variant="primary"
        />
      }
    />
  );
};
