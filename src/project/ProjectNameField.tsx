import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

const checkPattern = (value: string) => {
  if (!value) {
    return translate('Name is required field.');
  }
  if (value.trim().length < 3) {
    return translate('Name should contain at least 3 symbols.');
  }
};

const checkDuplicate = (value, props) =>
  props.customer?.projects.find(
    (project) => project.name === value && project.uuid !== props.project_uuid,
  )
    ? props.translate('Name is duplicated. Choose other name.')
    : undefined;

const validateProjectName = (value, _, props) =>
  checkDuplicate(value, props) || checkPattern(value);

interface ProjectNameFieldProps {
  isDisabled?: boolean;
  customer?;
}

export const ProjectNameField: FunctionComponent<ProjectNameFieldProps> = ({
  isDisabled = false,
}) => (
  <StringField
    label={translate('Project name')}
    name="name"
    description={translate('This name will be visible in accounting data.')}
    required={true}
    validate={validateProjectName}
    disabled={isDisabled}
  />
);
