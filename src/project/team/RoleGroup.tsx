import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

export const RoleGroup: FunctionComponent<{ isProjectManager }> = ({
  isProjectManager,
}) =>
  isProjectManager ? (
    <Form.Group>
      <Form.Control plaintext>
        <strong>{translate('Role')}</strong>: {translate(ENV.roles.manager)}
      </Form.Control>
    </Form.Group>
  ) : (
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
            <Field name="role" component="input" type="radio" value="member" />{' '}
            {translate(ENV.roles.member)}
          </label>
        </Form.Group>
      )}
    </>
  );
