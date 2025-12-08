import { projectsList } from 'waldur-js-client';

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
  projectsList({
    query: {
      name: value,
      customer: props.customer.uuid,
    },
  }).then((response) => {
    const exactMatch = response.data.find(
      (project) =>
        project.name === value && project.uuid !== props.project_uuid,
    );
    if (exactMatch) {
      return translate('Name is duplicated. Choose other name.');
    }
  });

export const validateProjectName = (value, props) => {
  const error = checkPattern(value);
  if (error) {
    return error;
  }
  return checkDuplicate(value, props);
};
