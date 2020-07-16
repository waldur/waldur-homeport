import * as React from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

export const TosGroup = () => (
  <FormGroup>
    <div className="checkbox col-sm-offset-3 col-xs-12">
      <label>
        <Field
          name="agree_with_policy"
          component="input"
          type="checkbox"
          required={true}
          validate={required}
        />
        {translate('I accept the')}{' '}
        <Link state="tos.freeipa" target="_blank">
          <i className="fa fa-external-link"></i>{' '}
          {translate('Terms of Service')}
        </Link>
      </label>
      <div className="help-block text-muted">
        {translate('You must agree with terms of service.')}
      </div>
    </div>
  </FormGroup>
);
