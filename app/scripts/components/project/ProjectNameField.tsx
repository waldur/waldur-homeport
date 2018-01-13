import * as React from 'react';

import { StringField } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

const validateProjectName = (value, _, props) =>
  props.customer.projects.find(project => project.name === value && project.uuid !== props.project_uuid) ?
  props.translate('Name is duplicated. Choose other name.') :
  undefined;

export const ProjectNameField = ({ translate }: TranslateProps) => (
  <StringField
    label={translate('Project name')}
    name="name"
    description={translate('This name will be visible in accounting data.')}
    required={true}
    validate={validateProjectName}
  />
);
