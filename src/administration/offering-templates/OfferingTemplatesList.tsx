import {
  marketplaceOfferingTemplatesList,
  OfferingTemplate,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { OfferingTemplateCreateButton } from './OfferingTemplateCreateButton';
import { OfferingTemplateExpandableRow } from './OfferingTemplateExpandableRow';
import { OfferingTemplateLoadPresetButton } from './OfferingTemplateLoadPresetButton';
import { OfferingTemplatePublishToggle } from './OfferingTemplatePublishToggle';
import { OfferingTemplateRowActions } from './OfferingTemplateRowActions';

export const OfferingTemplatesList = () => {
  const tableProps = useTable({
    table: 'offering-templates',
    fetchData: createFetcher(marketplaceOfferingTemplatesList),
    queryField: 'name',
  });
  return (
    <Table<OfferingTemplate>
      {...tableProps}
      title={translate('Offering templates')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          orderField: 'name',
        },
        {
          title: translate('Offering type'),
          render: ({ row }) => getLabel(row.offering_type),
        },
        {
          title: translate('Version'),
          render: ({ row }) => row.version,
        },
        {
          title: translate('Published'),
          render: ({ row }) => (
            <OfferingTemplatePublishToggle
              row={row}
              refetch={tableProps.fetch}
            />
          ),
        },
        {
          title: translate('Modified'),
          render: ({ row }) => formatDateTime(row.modified),
          orderField: 'modified',
        },
      ]}
      verboseName={translate('offering templates')}
      tableActions={
        <>
          <OfferingTemplateLoadPresetButton refetch={tableProps.fetch} />
          <OfferingTemplateCreateButton refetch={tableProps.fetch} />
        </>
      }
      rowActions={({ row }) => (
        <OfferingTemplateRowActions row={row} refetch={tableProps.fetch} />
      )}
      expandableRow={OfferingTemplateExpandableRow}
      hasQuery
    />
  );
};
