import * as React from 'react';
import { connect } from 'react-redux';
import Select, { Async } from 'react-select';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getCustomerList, getServiceProviderList } from '@waldur/marketplace/common/api';
import { AutocompleteField } from '@waldur/marketplace/landing/AutocompleteField';
import { offeringsAutocomplete } from '@waldur/marketplace/landing/store/api';
import { getCustomer, getWorkspace } from '@waldur/workspace/selectors';

const organizationAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['name', 'uuid'],
    o: 'name',
  };
  return getCustomerList(params).then(options => ({options}));
};

const providerAutocomplete = (query: string) => {
  const params = {
    name: query,
    field: ['customer_name', 'customer_uuid'],
    o: 'customer_name',
  };
  return getServiceProviderList(params).then(options => ({options}));
};

const getStates = () => [
  {value: 'pending', label: translate('Pending')},
  {value: 'executing', label: translate('Executing')},
  {value: 'done', label: translate('Done')},
  {value: 'erred', label: translate('Erred')},
  {value: 'terminated', label: translate('Terminated')},
];

interface OwnProps {
  showOfferingFilter?: boolean;
  showOrganizationFilter?: boolean;
  showProviderFilter?: boolean;
}

interface StateProps {
  offeringFilter: object;
}

const PureOrderItemsFilter = (props: OwnProps & StateProps) => (
  <div className="row">
    {props.showOfferingFilter && (
      <div className="form-group col-sm-3">
        <label className="control-label">
          {translate('Offering')}
        </label>
        <Field
          name="offering"
          component={fieldProps => (
            <AutocompleteField
              placeholder={translate('Select offering...')}
              loadOfferings={query => offeringsAutocomplete({
                name: query,
                ...props.offeringFilter,
              })}
              value={fieldProps.input.value}
              onChange={value => fieldProps.input.onChange(value)}
            />
          )}
        />
      </div>
    )}
    {props.showOrganizationFilter && (
      <div className="form-group col-sm-3">
        <label className="control-label">
          {translate('Client organization')}
        </label>
        <Field
          name="organization"
          component={fieldProps => (
            <Async
              placeholder={translate('Select organization...')}
              loadOptions={organizationAutocomplete}
              valueKey="uuid"
              labelKey="name"
              value={fieldProps.input.value}
              onChange={value => fieldProps.input.onChange(value)}
            />
          )}
        />
      </div>
    )}
    {props.showProviderFilter && (
      <div className="form-group col-sm-3">
        <label className="control-label">
          {translate('Service provider')}
        </label>
        <Field
          name="provider"
          component={fieldProps => (
            <Async
              placeholder={translate('Select provider...')}
              loadOptions={providerAutocomplete}
              valueKey="customer_uuid"
              labelKey="customer_name"
              value={fieldProps.input.value}
              onChange={value => fieldProps.input.onChange(value)}
            />
          )}
        />
      </div>
    )}
    <div className="form-group col-sm-3">
      <label className="control-label">
        {translate('State')}
      </label>
      <Field
        name="state"
        component={fieldProps => (
          <Select
            placeholder={translate('Select state...')}
            options={getStates()}
            value={fieldProps.input.value}
            onChange={value => fieldProps.input.onChange(value)}
          />
        )}
      />
    </div>
  </div>
);

const mapStateToProps = state => {
  const customer = getCustomer(state);
  const workspace = getWorkspace(state);
  if (workspace === 'organization') {
    return {
      offeringFilter: {
        customer_uuid: customer.uuid,
      },
    };
  }
};

const enhance = compose(
  reduxForm<{}, OwnProps>({form: 'OrderItemFilter'}),
  connect<StateProps, {}, OwnProps>(mapStateToProps),
);

export const OrderItemsFilter = enhance(PureOrderItemsFilter) as React.ComponentType<OwnProps>;
