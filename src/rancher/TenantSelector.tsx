import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const SelectTenantField = props => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    labelKey="service_name"
    valueKey="settings"
    simpleValue={true}
  />
);

const loadData = projectId => getAll(
  '/openstacktenant-service-project-link/',
  {params: {project_uuid: projectId}}
);

export const TenantSelector = props => {
  if (!props.project) {
    return null;
  }

  const {state: resourceProps, call: loadResource} = useQuery(loadData, props.project.uuid);
  React.useEffect(loadResource, [props.project]);

  if (resourceProps.loading) {
    return <LoadingSpinner/>;
  }

  if (resourceProps.erred) {
    return <div>{translate('Unable to load tenant.')}</div>;
  }

  if (resourceProps.loaded) {
    return (
      <FormGroup
        labelClassName="control-label col-sm-3"
        valueClassName="col-sm-9"
        required={true}
        label={translate('Tenant')}>
        <Field
          name="attributes.tenant_settings"
          validate={required}
          options={resourceProps.data}
          component={SelectTenantField}
        />
      </FormGroup>
    );
  }
  return null;
};
