import { FieldArray } from 'react-final-form-arrays';

import { translate } from '@waldur/i18n';

import { EmailsListGroup } from './EmailsListGroup';

const validateRows = (value) => {
  if (!value || value.length === 0) {
    return translate('At least one user is required');
  }

  const validRows = value.filter(
    (row) => row && row.email && row.role_project && row.role_project.role,
  );

  if (validRows.length === 0) {
    return translate('At least one complete user invitation is required');
  }

  return undefined;
};

export const EmailsListGroupWrapper = ({
  roles,
  customer,
  project,
  disabled,
}) => {
  return (
    <FieldArray
      name="rows"
      validate={validateRows}
      render={(arrayProps) => (
        <EmailsListGroup
          {...arrayProps}
          roles={roles}
          customer={customer}
          project={project}
          disabled={disabled}
        />
      )}
    />
  );
};
