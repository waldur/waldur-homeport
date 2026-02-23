import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { ProviderAutocomplete } from '@waldur/marketplace/orders/ProviderAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

const offeringProps = {
  offeringFilter: {
    billable: true,
  },
};

const PurePlanUsageFilter: FunctionComponent = () => (
  <>
    <TableFilterItem
      title={translate('Service provider')}
      name="provider"
      getValueLabel={(option) => option.customer_name}
    >
      <ProviderAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      getValueLabel={(option) => `${option.category_title} / ${option.name}`}
    >
      <OfferingAutocomplete
        {...offeringProps}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({ form: 'PlanUsageFilter', destroyOnUnmount: false });

export const PlanUsageFilter = enhance(PurePlanUsageFilter);
