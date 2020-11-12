import * as React from 'react';
import { Field } from 'redux-form';

import {
  PROJECT_ADMIN_ROLE,
  PROJECT_MANAGER_ROLE,
  PROJECT_MEMBER_ROLE,
} from '@waldur/core/constants';
import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { SelectField } from '@waldur/issues/create/SelectField';

export const ProjectRoleField: React.FC<{
  index: number;
  canChangeRole: boolean;
}> = ({ index, canChangeRole }) => {
  const options = React.useMemo(() => {
    const roles = [
      {
        value: PROJECT_ADMIN_ROLE,
        label: translate(ENV.roles.admin),
      },
      {
        value: PROJECT_MANAGER_ROLE,
        label: translate(ENV.roles.manager),
      },
    ];
    if (isFeatureVisible('project.support')) {
      roles.push({
        value: PROJECT_MEMBER_ROLE,
        label: ENV.roles.support,
      });
    }
    return roles;
  }, []);
  return (
    <Field
      name={`projects[${index}].role`}
      component={SelectField}
      isDisabled={!canChangeRole}
      simpleValue={true}
      options={options}
      isClearable={true}
    />
  );
};
