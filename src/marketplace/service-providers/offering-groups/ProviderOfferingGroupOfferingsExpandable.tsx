import { useCallback, useMemo } from 'react';
import {
  marketplaceProviderOfferingsList,
  OfferingGroup,
  ProviderOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { OfferingGLAuthConfigActionItem } from '@/marketplace/offerings/list/OfferingGLAuthConfigActionItem';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { offeringGroupOfferingsTableKey } from './constants';
import { OfferingGroupRemoveOfferingAction } from './OfferingGroupRemoveOfferingAction';

export const ProviderOfferingGroupOfferingsExpandable = ({
  group,
}: {
  group: OfferingGroup;
}) => {
  const user = useUser();
  const filter = useMemo(
    () => ({ offering_group_uuid: group.uuid }),
    [group.uuid],
  );
  const tableProps = useTable({
    table: offeringGroupOfferingsTableKey(group.uuid),
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    filter,
    mandatoryFields: [
      'uuid',
      'name',
      'category_title',
      'type',
      'state',
      'resources_count',
      'service_provider_can_create_offering_user', // OfferingGLAuthConfigActionItem
      'customer_uuid', // OfferingGroupRemoveOfferingAction
    ],
  });
  // Both menu rows hide themselves on their own terms — GLAuth only exists for
  // offerings that auto-create offering users, and removal needs
  // UPDATE_OFFERING — so a viewer with neither is given no trigger rather than
  // one that opens an empty menu. The permission is read off the group rather
  // than the rows, so for a viewer who may remove offerings the column does not
  // come and go between pages; for one who only sees GLAuth it follows the rows.
  const canRemoveFromGroup = Boolean(
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_OFFERING,
      customerId: group.customer_uuid,
    }),
  );

  const RowActions = useCallback(
    ({ row }: { row: ProviderOffering }) =>
      canRemoveFromGroup || row.service_provider_can_create_offering_user ? (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <OfferingGLAuthConfigActionItem row={row} />
          <OfferingGroupRemoveOfferingAction
            row={row}
            refetch={tableProps.fetch}
          />
        </ActionsDropdown>
      ) : null,
    [canRemoveFromGroup, tableProps.fetch],
  );

  // useTable widens the row type and drops the flag mandatoryFields asks for.
  const anyRowHasActions =
    canRemoveFromGroup ||
    (tableProps.rows ?? []).some(
      (row) =>
        (row as Partial<ProviderOffering>)
          .service_provider_can_create_offering_user,
    );

  return (
    <Table<ProviderOffering>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Category'),
          render: ({ row }) => renderFieldOrDash(row.category_title),
        },
        {
          title: translate('Type'),
          render: ({ row }) => row.type,
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Resources'),
          render: ({ row }) => row.resources_count ?? 0,
        },
      ]}
      verboseName={translate('Offerings')}
      showPageSizeSelector={true}
      title={translate('Offerings')}
      // Undefined drops the Actions column itself: with nothing to put in it
      // on any row, a column of blank cells is as much noise as the empty
      // menu it replaced.
      rowActions={anyRowHasActions ? RowActions : undefined}
    />
  );
};
