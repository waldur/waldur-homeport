import { FunctionComponent } from 'react';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table/index';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CampaignStateIndicator } from './CampaignStateIndicator';

const TableComponent: FunctionComponent<any> = (props) => {
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
        },
        {
          title: translate('Start date'),
          render: ({ row }) => formatDate(row.start_date),
        },
        {
          title: translate('End date'),
          render: ({ row }) => formatDate(row.end_date),
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('campaigns')}
    />
  );
};

const TableOptions = {
  table: 'marketplace-provider-campaigns',
  fetchData: createFetcher('promotions-campaigns'),
  mapPropsToFilter: ({ provider }) => ({
    service_provider_uuid: provider.uuid,
  }),
};

const ProviderCampaignsListComponent = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<any>;

export const ProviderCampaignsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return <ProviderCampaignsListComponent provider={provider} />;
};
