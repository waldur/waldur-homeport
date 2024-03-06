import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CallAutocomplete } from '../CallAutocomplete';
import { OFFERING_REQUESTS_FILTER_FORM_ID } from '../constants';

const choices = [
  {
    label: translate('Requested'),
    value: '1',
  },
  {
    label: translate('Accepted'),
    value: '2',
  },
  {
    label: translate('Canceled'),
    value: '3',
  },
];

const PureOfferingRequestsTableFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Call')}
      name="call"
      badgeValue={(value) => value?.name}
    >
      <CallAutocomplete />
    </TableFilterItem>
    <TableFilterItem title={translate('Status')} name="state">
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select status...')}
            options={choices}
            value={fieldProps.input.value}
            onChange={(item) => fieldProps.input.onChange(item)}
            isMulti={true}
            isClearable={true}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingAutocomplete
        offeringFilter={{ shared: true }}
        providerOfferings={false}
      />
    </TableFilterItem>
  </>
);

const enhance = reduxForm({
  form: OFFERING_REQUESTS_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const OfferingRequestsTableFilter = enhance(
  PureOfferingRequestsTableFilter,
);
