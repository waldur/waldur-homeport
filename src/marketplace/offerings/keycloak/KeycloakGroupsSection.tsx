import {
  ArrowsClockwiseIcon,
  CloudArrowDownIcon,
  LinkBreakIcon,
} from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  OfferingKeycloakGroup,
  offeringKeycloakGroupsDestroy,
  offeringKeycloakGroupsList,
  offeringKeycloakGroupsPullMembers,
  offeringKeycloakGroupsSetBackendId,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { useNotify } from '@/store/notify';
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
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Remap')}
      action={() =>
        openDialog(RemapGroupDialog, {
          resolve: { group: row, offering_uuid, refetch },
        })
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
  const { showSuccess } = useNotify();
  if (!row.backend_id) return null;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      const response = await offeringKeycloakGroupsPullMembers({
        path: { uuid: row.uuid },
      });
      const { created, updated, total_remote } = response.data;
      showSuccess(
        translate(
          'Synced {total_remote} members ({created} new, {updated} updated).',
          { total_remote, created, updated },
        ),
      );
    },
    errorMessage: translate('Unable to sync members.'),
    refetch,
  });

  return (
    <ActionItem
      title={isPending ? translate('Syncing...') : translate('Sync members')}
      action={mutate}
      disabled={isPending}
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
  if (!row.backend_id) return null;

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      offeringKeycloakGroupsSetBackendId({
        path: { uuid: row.uuid },
        body: { backend_id: null },
      }),
    successMessage: translate('Group has been unlinked.'),
    errorMessage: translate('Unable to unlink group.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to unlink {name} from its remote Keycloak group?',
        {
          name: <strong>{row.name}</strong>,
        },
        formatJsxTemplate,
      ),
    },
  });

  return (
    <ActionItem
      title={translate('Unlink')}
      action={mutate}
      disabled={isPending}
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
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      offeringKeycloakGroupsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Group has been deleted.'),
    errorMessage: translate('Unable to delete group.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete group {name}? This will also remove it from Keycloak if synced.',
        {
          name: <strong>{row.name}</strong>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};

export const KeycloakGroupsSection: FC<OfferingSectionProps> = (props) => {
  const { openDialog } = useModal();
  const filter = useMemo(() => ({ offering_uuid: props.offering.uuid }), []);
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
            openDialog(ImportRemoteGroupDialog, {
              resolve: {
                offering: props.offering,
                refetch: tableProps.fetch,
              },
            })
          }
          variant="primary"
        />
      }
    />
  );
};
