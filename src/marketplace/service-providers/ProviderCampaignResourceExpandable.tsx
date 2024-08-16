import { useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { PublicResourceLink } from '@waldur/marketplace/resources/list/PublicResourceLink';
import { createFetcher, Table } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';

export const ProviderCampaignResourceExpandable = ({ campaign }) => {
  const tableOptions = useMemo(
    () => ({
      table: 'marketplace-provider-campaign-resources',
      fetchData: createFetcher(
        `promotions-campaigns/${campaign.uuid}/resources`,
      ),
    }),
    [campaign],
  );
  const tableProps = useTable(tableOptions);
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: PublicResourceLink,
          copyField: (row) => row.name || row.offering_name,
        },
        {
          title: translate('Category'),
          render: ({ row }) => row.category_title,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
        },
      ]}
      verboseName={translate('Resources')}
      hasActionBar={false}
      showPageSizeSelector={true}
    />
  );
};
