import { FunctionComponent, useCallback } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { CampaignCreateButton } from '@waldur/marketplace/service-providers/CampaignCreateButton';
import { ProviderCampaignActions } from '@waldur/marketplace/service-providers/ProviderCampaignActions';
import { ProviderCampaignFilter } from '@waldur/marketplace/service-providers/ProviderCampaignFilter';
import { ProviderCampaignResourceExpandable } from '@waldur/marketplace/service-providers/ProviderCampaignResourceExpandable';
import { RootState } from '@waldur/store/reducers';
import { connectTable, createFetcher, Table } from '@waldur/table/index';

import { CustomerResourcesListPlaceholder } from '../resources/list/CustomerResourcesListPlaceholder';

import { CampaignStateIndicator } from './CampaignStateIndicator';

const TableComponent: FunctionComponent<any> = (props) => {
  const ExpandableRow = useCallback(
    ({ row }) => <ProviderCampaignResourceExpandable campaign={row} />,
    [],
  );
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
          orderField: 'start_date',
        },
        {
          title: translate('End date'),
          render: ({ row }) => formatDate(row.end_date),
          orderField: 'end_date',
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('campaigns')}
      actions={<CampaignCreateButton refetch={props.fetch} />}
      hasQuery={true}
      hoverableRow={ProviderCampaignActions}
      expandableRow={ExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, any> = {};
  if (props.filter) {
    if (props.filter.state) {
      filter.state = props.filter.state.map((option) => option.value);
    }
    if (props.filter.provider) {
      filter.service_provider_uuid = props.filter.provider.uuid;
    }
    if (props.filter.discount_type) {
      filter.discount_type = props.filter.discount_type.map(
        (option) => option.value,
      );
    }
  }
  return filter;
};

const TableOptions = {
  table: 'marketplace-provider-campaigns',
  fetchData: createFetcher('promotions-campaigns'),
  mapPropsToFilter,
  queryField: 'query',
};

const mapStateToProps = (state: RootState) => ({
  filter: getFormValues('ProviderCampaignFilter')(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

const ProviderCampaignsListComponent = enhance(
  TableComponent,
) as React.ComponentType<any>;

export const ProviderCampaignsList = ({ provider }) => {
  if (!provider) {
    return <CustomerResourcesListPlaceholder />;
  }
  return (
    <ProviderCampaignsListComponent
      provider={provider}
      filters={<ProviderCampaignFilter />}
    />
  );
};
