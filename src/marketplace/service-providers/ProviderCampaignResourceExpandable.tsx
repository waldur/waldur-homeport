import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { promotionsCampaignsResourcesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { PublicResourceLink } from '@/marketplace/resources/list/PublicResourceLink';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

export const ProviderCampaignResourceExpandable = ({ campaign }) => {
  // The endpoint sends every resource at once: fetch them once and page
  // through them in memory.
  const { data, isLoading, error } = useQuery({
    queryKey: ['ProviderCampaignResources', campaign.uuid],
    queryFn: () =>
      promotionsCampaignsResourcesList({
        path: { uuid: campaign.uuid },
      }).then((response) => response.data),
  });
  const tableProps = useTable({
    table: `marketplace-provider-campaign-resources-${campaign.uuid}`,
    fetchData: createClientPaginatedFetcher(data ?? []),
  });
  useEffect(() => {
    tableProps.fetch();
  }, [data]);
  return (
    <Table
      {...tableProps}
      loading={isLoading || tableProps.loading}
      error={error || tableProps.error}
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
