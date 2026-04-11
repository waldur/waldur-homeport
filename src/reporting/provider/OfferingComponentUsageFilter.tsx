import { FC } from 'react';
import { connect } from 'react-redux';
import {
  Field,
  formValueSelector,
  InjectedFormProps,
  reduxForm,
} from 'redux-form';

import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { InputField } from '@waldur/form/InputField';
import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { providerAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { OfferingTypeAutocomplete } from '@waldur/marketplace/offerings/details/OfferingTypeAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const COMPONENT_USAGE_FILTER_FORM_ID = 'OfferingComponentUsageFilter';

type FormData = {
  provider?: any;
  offering?: any;
  offering_type?: any;
  component_type?: string;
};

const PureOfferingComponentUsageFilter: FC<
  { provider?: any } & InjectedFormProps<FormData>
> = ({ provider }) => (
  <>
    <TableFilterItem
      title={translate('Service provider')}
      name="provider"
      badgeValue={(value) => value?.customer_name}
    >
      <AsyncSelectField
        name="provider"
        placeholder={translate('Select service provider...')}
        loadOptions={providerAutocomplete}
        getOptionLabel={({ customer_name }) => customer_name}
        getOptionValue={({ customer_uuid }) => customer_uuid}
        {...REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => value?.name}
    >
      <OfferingAutocomplete
        name="offering"
        offeringFilter={
          provider ? { customer_uuid: provider.customer_uuid } : {}
        }
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Integration type')}
      name="offering_type"
      badgeValue={(value) => value?.label}
    >
      <OfferingTypeAutocomplete reactSelectProps={REACT_SELECT_TABLE_FILTER} />
    </TableFilterItem>
    <TableFilterItem title={translate('Component type')} name="component_type">
      <Field
        name="component_type"
        component={(fieldProps) => (
          <InputField
            {...fieldProps}
            placeholder={translate('Enter component type...')}
          />
        )}
      />
    </TableFilterItem>
  </>
);

const selector = formValueSelector(COMPONENT_USAGE_FILTER_FORM_ID);

export const OfferingComponentUsageFilter = connect((state) => ({
  provider: selector(state, 'provider'),
}))(
  reduxForm<FormData, { provider?: any }>({
    form: COMPONENT_USAGE_FILTER_FORM_ID,
    destroyOnUnmount: false,
  })(PureOfferingComponentUsageFilter),
);
