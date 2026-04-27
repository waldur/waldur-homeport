import { useMemo } from 'react';
import { promotionsCampaignsResourcesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { PublicResourceLink } from '@/marketplace/resources/list/PublicResourceLink';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const ProviderCampaignResourceExpandable = ({ campaign }) => {
  const tableOptions = useMemo(
    () => ({
      table: 'marketplace-provider-campaign-resources',
      fetchData: createFetcher(promotionsCampaignsResourcesList, {
        path: { uuid: campaign.uuid },
      }),
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
