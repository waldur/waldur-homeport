import * as classNames from 'classnames';
import * as React from 'react';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import BootstrapTooltip from 'react-bootstrap/lib/Tooltip';
import { Field } from 'redux-form';

import { ENV } from '@waldur/core/services';
import { renderValidationWrapper } from '@waldur/form/FieldValidationWrapper';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

// These limitations are imposed by underlying operating system
const MAXIMUM_USERNAME_LENGTH = 32;
const USERNAME_PATTERN = new RegExp(
  '^[a-zA-Z0-9_.][a-zA-Z0-9_.-]*[a-zA-Z0-9_.$-]?$',
);

const validateUsername = (username: string) => {
  if (!username) {
    return translate('Username is required.');
  }
  if (!username.match(USERNAME_PATTERN)) {
    return translate(
      'Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_) and periods (.).',
    );
  }
  if (username.length < 3) {
    return translate('Minimum username length is 3 characters.');
  }
  if (
    username.length >
    MAXIMUM_USERNAME_LENGTH - ENV.FREEIPA_USERNAME_PREFIX.length
  ) {
    return translate(
      'Maximum username length with mandatory username prefix is 32 characters.',
    );
  }
};

export const UsernameGroup = () => (
  <FormGroup>
    <Col sm={3} componentClass={ControlLabel}>
      {translate('Username')}
    </Col>
    <Col sm={6}>
      <div
        className={classNames('m-b-sm', {
          'input-group': ENV.FREEIPA_USERNAME_PREFIX,
        })}
      >
        {ENV.FREEIPA_USERNAME_PREFIX && (
          <OverlayTrigger
            placement="top"
            overlay={
              <BootstrapTooltip id="freeipa-username-prefix">
                {translate('Username prefix')}
              </BootstrapTooltip>
            }
          >
            <InputGroup.Addon>{ENV.FREEIPA_USERNAME_PREFIX}</InputGroup.Addon>
          </OverlayTrigger>
        )}
        <Field
          name="username"
          component={renderValidationWrapper(InputField)}
          type="text"
          validate={validateUsername}
          required={true}
        />
      </div>
      <p className="form-text text-muted">
        {translate(
          'Please select a username that you will use for login into the Linux systems.',
        )}
      </p>
    </Col>
  </FormGroup>
);
