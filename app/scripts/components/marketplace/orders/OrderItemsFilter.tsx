import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';
import { offeringsAutocomplete } from '@waldur/marketplace/landing/store/api';
import { getCustomer } from '@waldur/workspace/selectors';

const PureOrderItemsFilter = props => (
  <Field
    name="offering"
    component={fieldProps => (
      <AutocompleteField
        placeholder={translate('Select offering...')}
        loadOfferings={query => offeringsAutocomplete(query, props.customer.uuid)}
        value={fieldProps.input.value}
        onChange={value => fieldProps.input.onChange(value)}
      />
    )}
  />
);

const mapStateToProps = state => ({
  customer: getCustomer(state),
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({form: 'OrderItemFilter'}),
);

export const OrderItemsFilter = enhance(PureOrderItemsFilter);
