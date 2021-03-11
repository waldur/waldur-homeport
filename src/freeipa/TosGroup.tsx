import { FunctionComponent } from 'react';
import { FormGroup } from 'react-bootstrap';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { required } from '@waldur/core/validators';
import { formatJsx, translate } from '@waldur/i18n';

export const TosGroup: FunctionComponent = () => (
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
        {translate(
          'I accept the <Link>Terms of Service</Link>.',
          {
            Link: (s) => (
              <Link state="tos.freeipa" target="_blank">
                <i className="fa fa-external-link"></i> {s}
              </Link>
            ),
          },
          formatJsx,
        )}
      </label>
      <div className="help-block text-muted">
        {translate('You must agree with terms of service.')}
      </div>
    </div>
  </FormGroup>
);
