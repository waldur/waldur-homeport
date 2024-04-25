import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { ProviderCampaignStateFilter } from '@waldur/marketplace/service-providers/ProviderCampaignStateFilter';
import { ProviderCampaignTypeFilter } from '@waldur/marketplace/service-providers/ProviderCampaignTypeFilter';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const PureProviderCampaignFilter: FunctionComponent = () => {
  return (
    <>
      <TableFilterItem
        title={translate('Service provider')}
        name="provider"
        getValueLabel={(value) => value?.customer_name}
      >
        <ProviderAutocomplete />
      </TableFilterItem>
      <TableFilterItem title={translate('State')} name="state">
        <ProviderCampaignStateFilter />
      </TableFilterItem>
      <TableFilterItem title={translate('Discount type')} name="discount_type">
        <ProviderCampaignTypeFilter />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: 'ProviderCampaignFilter',
  destroyOnUnmount: false,
});

export const ProviderCampaignFilter = enhance(PureProviderCampaignFilter);
