import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { Field } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { getCustomer } from '@waldur/workspace/selectors';

const SelectTenantField: FunctionComponent<any> = (props) => (
  <Select
    value={props.options.filter(({ url }) => url === props.input.value)}
    onChange={({ url }) => props.input.onChange(url)}
    options={props.options}
    getOptionValue={(option) => option.url}
    getOptionLabel={(option) => option.name}
    isClearable={true}
  />
);

const loadData = (customer_uuid) =>
  getAll('/service-settings/', {
    params: {
      customer_uuid,
      shared: false,
      type: 'OpenStackTenant',
      field: ['name', 'url'],
    },
  });

export const TenantSelector: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const resourceProps = useAsync(() => loadData(customer.uuid), [customer]);

  if (resourceProps.loading) {
    return <LoadingSpinner />;
  }

  if (resourceProps.error) {
    return <div>{translate('Unable to load tenant.')}</div>;
  }

  if (resourceProps.value) {
    return (
      <FormGroup
        labelClassName="col-sm-3"
        valueClassName="col-sm-9"
        required={true}
        label={translate('Tenant')}
      >
        <Field
          name="attributes.tenant_settings"
          validate={required}
          options={resourceProps.value}
          component={SelectTenantField}
        />
      </FormGroup>
    );
  }
  return null;
};
