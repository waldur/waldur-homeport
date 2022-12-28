import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';

export const RoleGroup: FunctionComponent<{ roles }> = ({ roles }) => (
  <Form.Group className="mb-5">
    <Form.Label>{translate('Role')}</Form.Label>

    {roles.map((role, index) => (
      <>
        <div className="d-flex fv-row" key={index}>
          <div className="form-check form-check-custom form-check-solid">
            <Field
              component="input"
              name="role"
              type="radio"
              className="form-check-input me-3"
              value={role.value}
              id={role.value}
            />
            <label className="form-check-label" htmlFor={role.value}>
              <div className="fw-bold text-gray-800">
                {translate(role.title)}
              </div>
            </label>
          </div>
        </div>
        {index != roles.length - 1 ? (
          <div className="separator separator-dashed my-5" />
        ) : null}
      </>
    ))}
  </Form.Group>
);
