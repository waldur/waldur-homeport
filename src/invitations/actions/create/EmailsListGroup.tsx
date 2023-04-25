import { Fragment, useCallback, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { email, required } from '@waldur/core/validators';
import { isFeatureVisible } from '@waldur/features/connect';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';

import { CivilNumberGroup } from '../CivilNumberGroup';
import { LoadUserDetailsButton } from '../LoadUserDetailsButton';
import { TaxNumberGroup } from '../TaxNumberGroup';
import { EmailInviteUser, StoredUserDetails } from '../types';
import { UserDetailsGroup } from '../UserDetailsGroup';

import { RoleAndProjectSelectField } from './RoleAndProjectSelectField';

export const EmailsListGroup = ({
  fields,
  roles,
  customer,
  project,
  fetchUserDetails,
  usersDetails,
  disabled,
}) => {
  const [warn, setWarn] = useState(false);

  const addRow = useCallback(() => {
    let emptyEmails = 0;
    if (fields._isFieldArray) {
      fields.forEach((_, i) => {
        if (!fields.get(i)?.email) emptyEmails++;
      });
    }
    if (emptyEmails < 5) {
      if (project) fields.push({ project });
      else fields.push({});
    } else {
      setWarn(true);
      setTimeout(() => setWarn(false), 2000);
    }
  }, [fields, project]);

  const removeRow = (index) => fields._isFieldArray && fields.remove(index);

  const getUserDetails = useCallback(
    (user: EmailInviteUser): StoredUserDetails =>
      usersDetails.find((u) => u.civil_number === user.civil_number),
    [],
  );

  const isRoleDisabled = useCallback(
    (userDetails: StoredUserDetails) =>
      isFeatureVisible('invitation.require_user_details') && !userDetails,
    [],
  );

  return (
    <div className="scroll-y mh-400px">
      {fields.length > 0 && (
        <Form.Group id="emails-list-group">
          <div>
            <table className="table">
              <thead>
                <tr>
                  <td className="w-250px">{translate('Email')}</td>
                  {!isFeatureVisible('invitations.conceal_civil_number') && (
                    <td className="id-column">{translate('Civil number')}</td>
                  )}
                  {isFeatureVisible('invitation.show_tax_number') && (
                    <td className="tax-column">{translate('Tax number')}</td>
                  )}
                  <td className="role-column">{translate('Role')}</td>
                  <td className="w-5px"></td>
                </tr>
              </thead>
              <tbody>
                {fields.map((user, i) => {
                  const userDetails = getUserDetails(fields.get(i));
                  return (
                    <Fragment key={user}>
                      <tr>
                        <td>
                          <Field
                            name={`${user}.email`}
                            required={true}
                            component={EmailField}
                            validate={[required, email]}
                          />
                        </td>
                        {isFeatureVisible(
                          'invitations.conceal_civil_number',
                        ) ? null : (
                          <td>
                            <CivilNumberGroup
                              name={`${user}.civil_number`}
                              disabled={disabled}
                            />
                          </td>
                        )}
                        {isFeatureVisible('invitation.show_tax_number') &&
                          isFeatureVisible(
                            'invitation.require_user_details',
                          ) && (
                            <td>
                              <TaxNumberGroup
                                name={`${user}.tax_number`}
                                disabled={disabled}
                              />
                              <LoadUserDetailsButton
                                loading={disabled}
                                onClick={() => fetchUserDetails(fields.get(i))}
                              />
                            </td>
                          )}
                        <td className="role-column">
                          <RoleAndProjectSelectField
                            name={`${user}.role_project`}
                            roles={roles}
                            customer={customer}
                            currentProject={project}
                            disabled={isRoleDisabled(userDetails)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="light-danger"
                            className="btn-icon"
                            onClick={() => removeRow(i)}
                          >
                            <i className="fa fa-trash fs-4"></i>
                          </Button>
                        </td>
                      </tr>
                      {userDetails && (
                        <tr>
                          <td colSpan={10}>
                            <UserDetailsGroup
                              userDetails={userDetails.details}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Form.Group>
      )}
      <div>
        <Button
          variant="light"
          className="btn-icon"
          disabled={warn}
          onClick={addRow}
        >
          <i className="fa fa-plus fs-4"></i>
        </Button>
        {warn && (
          <span className="text-danger ms-2">
            {translate('Too many empty fields')}
          </span>
        )}
      </div>
    </div>
  );
};
