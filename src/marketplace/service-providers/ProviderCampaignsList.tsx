import { FunctionComponent, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { CampaignCreateButton } from '@waldur/marketplace/service-providers/CampaignCreateButton';
import { ProviderCampaignActions } from '@waldur/marketplace/service-providers/ProviderCampaignActions';
import { ProviderCampaignFilter } from '@waldur/marketplace/service-providers/ProviderCampaignFilter';
import { ProviderCampaignResourceExpandable } from '@waldur/marketplace/service-providers/ProviderCampaignResourceExpandable';
import { createFetcher, Table } from '@waldur/table/index';
import { useTable } from '@waldur/table/utils';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CampaignStateIndicator } from './CampaignStateIndicator';

const ProviderCampaignsListComponent: FunctionComponent<{ provider }> = ({
  provider,
}) => {
  const ExpandableRow = useCallback(
    ({ row }) => <ProviderCampaignResourceExpandable campaign={row} />,
    [],
  );
  const filterValues: any = useSelector(
    getFormValues('ProviderCampaignFilter'),
  );
  const filter = useMemo(() => {
    const filter: Record<string, any> = {};
    if (provider) {
      filter.service_provider_uuid = provider.uuid;
    }
    if (filterValues) {
      if (filterValues.state) {
        filter.state = filterValues.state.map((option) => option.value);
      }
      if (filterValues.discount_type) {
        filter.discount_type = filterValues.discount_type.map(
          (option) => option.value,
        );
      }
    }
    return filter;
  }, [filterValues, provider]);
  const props = useTable({
    table: 'marketplace-provider-campaigns',
    fetchData: createFetcher('promotions-campaigns'),
    filter,
    queryField: 'query',
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Coupon'),
          render: ({ row }) => row.coupon || 'N/A',
        },
        {
          title: translate('Status'),
          render: CampaignStateIndicator,
          filter: 'state',
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
      filters={<ProviderCampaignFilter />}
    />
  );
};

export const ProviderCampaignsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderCampaignsListComponent provider={provider} />;
};
