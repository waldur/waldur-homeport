import { FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { EmailsListGroup } from './EmailsListGroup';

export const EmailsListGroupWrapper = ({
  roles,
  customer,
  project,
  fetchUserDetails,
  usersDetails,
  disabled,
}) => {
  return (
    <>
      <h2 className="mb-10">{translate('Invite by email')}</h2>
      <FieldArray
        name="users"
        roles={roles}
        customer={customer}
        project={project}
        component={EmailsListGroup}
        validate={[required]}
        fetchUserDetails={fetchUserDetails}
        usersDetails={usersDetails}
        disabled={disabled}
      />
    </>
  );
};
