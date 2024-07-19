import { FunctionComponent } from 'react';
import { Field, reduxForm } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OrganizationAutocomplete } from '@waldur/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { CallAutocomplete } from '../CallAutocomplete';
import { OFFERING_REQUESTS_FILTER_FORM_ID } from '../constants';
import { getCallOfferingStateOptions } from '../utils';

const PureOfferingRequestsTableFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      badgeValue={(value) => value?.name}
    >
      <OrganizationAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Call')}
      name="call"
      badgeValue={(value) => value?.name}
    >
      <CallAutocomplete
        protectedCalls
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem title={translate('Status')} name="state">
      <Field
        name="state"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Select status...')}
            options={getCallOfferingStateOptions()}
            value={fieldProps.input.value}
            onChange={(item) => fieldProps.input.onChange(item)}
            isMulti={true}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
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
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
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
