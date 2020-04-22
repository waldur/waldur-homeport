import * as React from 'react';

import { LATIN_NAME_PATTERN } from '@waldur/core/utils';
import { StringField } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

const checkPattern = (value: string, props) => {
  if (!value) {
    return props.translate('Name is required field.');
  }
  if (value.trim().length < 3) {
    return props.translate('Name should contain at least 3 symbols.');
  }
  if (!props.enforceLatinName) {
    return;
  }
  if (LATIN_NAME_PATTERN.test(value)) {
    return;
  }
  return props.translate('Name contains invalid symbols.');
};

const checkDuplicate = (value, props) =>
  props.customer.projects.find(
    project => project.name === value && project.uuid !== props.project_uuid,
  )
    ? props.translate('Name is duplicated. Choose other name.')
    : undefined;

const validateProjectName = (value, _, props) =>
  checkDuplicate(value, props) || checkPattern(value, props);

export const ProjectNameField = ({ translate }: TranslateProps) => (
  <StringField
    label={translate('Project name')}
    name="name"
    description={translate('This name will be visible in accounting data.')}
    required={true}
    validate={validateProjectName}
  />
);
