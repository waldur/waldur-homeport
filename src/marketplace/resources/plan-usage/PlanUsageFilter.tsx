import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

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
    <TableFilterItem title={translate('Service provider')} name="provider">
      <ProviderAutocomplete />
    </TableFilterItem>
    <TableFilterItem title={translate('Offering')} name="offering">
      <OfferingAutocomplete {...offeringProps} />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({ form: 'PlanUsageFilter', destroyOnUnmount: false });

export const PlanUsageFilter = enhance(PurePlanUsageFilter);
