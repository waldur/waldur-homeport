import * as React from 'react';
import Select from 'react-select';
import useAsync from 'react-use/lib/useAsync';
import { Field } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const SelectTenantField = props => (
  <Select
    value={props.input.value}
    onChange={props.input.onChange}
    options={props.options}
    labelKey="name"
    valueKey="settings"
    simpleValue={true}
  />
);

const loadData = projectId =>
  getAll('/openstacktenant/', {
    params: { project_uuid: projectId },
  });

export const TenantSelector = props => {
  const resourceProps = useAsync(() => loadData(props.project.uuid), [
    props.project,
  ]);

  if (resourceProps.loading) {
    return <LoadingSpinner />;
  }

  if (resourceProps.error) {
    return <div>{translate('Unable to load tenant.')}</div>;
  }

  if (resourceProps.value) {
    return (
      <FormGroup
        labelClassName="control-label col-sm-3"
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
