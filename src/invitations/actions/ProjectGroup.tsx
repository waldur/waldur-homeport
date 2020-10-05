import * as React from 'react';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const ProjectGroup = ({ customer, disabled }) => (
  <FormGroup>
    <ControlLabel>
      {translate('Project')}
      <span className="text-danger">*</span>
    </ControlLabel>
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
  </FormGroup>
);
