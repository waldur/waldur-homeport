import { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Campaign, promotionsCampaignsList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { CampaignCreateButton } from '@/marketplace/service-providers/CampaignCreateButton';
import { ProviderCampaignActions } from '@/marketplace/service-providers/ProviderCampaignActions';
import { ProviderCampaignResourceExpandable } from '@/marketplace/service-providers/ProviderCampaignResourceExpandable';
import { createFetcher } from '@/table/api';
import {
  PromotionsCampaignsFilter,
  selectPromotionsCampaignsFilter,
  CampaignStateOptions,
} from '@/table/generated/PromotionsCampaignsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CampaignStateIndicator } from './CampaignStateIndicator';

const ProviderCampaignsListComponent: FunctionComponent<{ provider }> = ({
  provider,
}) => {
  const ExpandableRow = useCallback(
    ({ row }) => <ProviderCampaignResourceExpandable campaign={row} />,
    [],
  );
  const formFilter = useSelector(selectPromotionsCampaignsFilter);
  const filter = useMemo(
    () => ({
      service_provider_uuid: provider?.uuid,
      ...formFilter,
    }),
    [formFilter, provider?.uuid],
  );
  const props = useTable({
    table: 'marketplace-provider-campaigns',
    fetchData: createFetcher(promotionsCampaignsList),
    filter,
    queryField: 'query',
  });
  return (
    <Table<Campaign>
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
          copyField: (row) => row.name,
        },
        {
          title: translate('Coupon'),
          render: ({ row }) => renderFieldOrDash(row.coupon),
        },
        {
          title: translate('Status'),
          render: CampaignStateIndicator,
          filter: 'state',
          inlineFilter: (row) =>
            CampaignStateOptions.filter(
              (op) => op.value === (row.state ?? '').toLowerCase(),
            ),
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{formatDate(row.start_date)}</>,
          orderField: 'start_date',
        },
        {
          title: translate('End date'),
          render: ({ row }) => <>{formatDate(row.end_date)}</>,
          orderField: 'end_date',
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('campaigns')}
      tableActions={<CampaignCreateButton refetch={props.fetch} />}
      hasQuery={true}
      rowActions={ProviderCampaignActions}
      expandableRow={ExpandableRow}
      filters={<PromotionsCampaignsFilter />}
    />
  );
};

export const ProviderCampaignsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderCampaignsListComponent provider={provider} />;
};
