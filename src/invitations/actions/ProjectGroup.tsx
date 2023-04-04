import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const PureProjectSelectorField = ({ name, customer, disabled }) => (
  <Field
    name={name}
    component={SelectField}
    options={customer.projects}
    required={true}
    validate={[required]}
    isDisabled={disabled}
    placeholder={translate('Select project')}
    getOptionValue={(option) => option.uuid}
    getOptionLabel={(option) => option.name}
    isClearable={true}
  />
);

export const ProjectGroup: FunctionComponent<{ customer; disabled }> = ({
  customer,
  disabled,
}) => (
  <Form.Group>
    <Form.Label>
      {translate('Project')}
      <span className="text-danger">*</span>
    </Form.Label>
    <PureProjectSelectorField
      name="project"
      customer={customer}
      disabled={disabled}
    />
  </Form.Group>
);
