import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const ProjectGroup: FunctionComponent<{ customer; disabled }> = ({
  customer,
  disabled,
}) => (
  <Form.Group>
    <Form.Label>
      {translate('Project')}
      <span className="text-danger">*</span>
    </Form.Label>
    <Field
      name="project"
      component={SelectField}
      options={customer.projects}
      required={true}
      isDisabled={disabled}
      placeholder={translate('Select project')}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => option.name}
      isClearable={true}
      {...reactSelectMenuPortaling()}
    />
  </Form.Group>
);
