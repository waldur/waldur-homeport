import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import {
  checkCustomerUser,
  getCustomer,
  getUser,
} from '@waldur/workspace/selectors';

export const RoleGroup: FunctionComponent<{ isProjectManager }> = ({
  isProjectManager,
}) => {
  const currentUser = useSelector(getUser);
  const currentCustomer = useSelector(getCustomer);
  const canChangeRole = checkCustomerUser(currentCustomer, currentUser);

  if (isProjectManager && !canChangeRole) {
    return (
      <Form.Group>
        <p>
          <strong>{translate('Role')}</strong>: {translate(ENV.roles.manager)}
        </p>
      </Form.Group>
    );
  } else {
    return (
      <>
        <Form.Group>
          <label>
            <Field name="role" component="input" type="radio" value="manager" />{' '}
            {translate(ENV.roles.manager)}
          </label>
        </Form.Group>
        <Form.Group>
          <label>
            <Field name="role" component="input" type="radio" value="admin" />{' '}
            {translate(ENV.roles.admin)}
          </label>
        </Form.Group>
        {isFeatureVisible('project.member_role') && (
          <Form.Group>
            <label>
              <Field
                name="role"
                component="input"
                type="radio"
                value="member"
              />{' '}
              {translate(ENV.roles.member)}
            </label>
          </Form.Group>
        )}
      </>
    );
  }
};
