import { translate } from '@waldur/i18n';

const checkPattern = (value: string) => {
  if (!value) {
    return translate('Name is required field.');
  }
  const length = value.trim().length;
  if (length < 3) {
    return translate('Name should contain at least 3 symbols.');
  }
  if (length > 500) {
    return translate('Must be 500 characters or less.');
  }
};

const checkDuplicate = (value, props) =>
  props.customer?.projects &&
  props.customer.projects.find(
    (project) => project.name === value && project.uuid !== props.project_uuid,
  )
    ? translate('Name is duplicated. Choose other name.')
    : undefined;

export const validateProjectName = (value, props) =>
  checkDuplicate(value, props) || checkPattern(value);
