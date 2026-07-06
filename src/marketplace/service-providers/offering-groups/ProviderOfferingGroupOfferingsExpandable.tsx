import { useMemo } from 'react';
import {
  marketplaceProviderOfferingsList,
  OfferingGroup,
  ProviderOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { OfferingGLAuthConfigActionItem } from '@/marketplace/offerings/list/OfferingGLAuthConfigActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const ProviderOfferingGroupOfferingsExpandable = ({
  group,
}: {
  group: OfferingGroup;
}) => {
  const filter = useMemo(
    () => ({ offering_group_uuid: group.uuid }),
    [group.uuid],
  );
  const tableProps = useTable({
    table: `marketplace-offering-group-${group.uuid}-offerings`,
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
    ],
  });
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
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <OfferingGLAuthConfigActionItem row={row} />
        </ActionsDropdown>
      )}
    />
  );
};
