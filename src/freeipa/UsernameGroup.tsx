import { FunctionComponent } from 'react';
import { Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { FieldError, StringField } from '@waldur/form';
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
    MAXIMUM_USERNAME_LENGTH - ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX.length
  ) {
    return translate(
      'Maximum username length with mandatory username prefix is 32 characters.',
    );
  }
};

const UsernameField: FunctionComponent<WrappedFieldProps> = (props) => (
  <>
    <InputGroup className="mb-2">
      {ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="freeipa-username-prefix">
              {translate('Username prefix')}
            </Tooltip>
          }
        >
          <InputGroup.Text>
            {ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX}
          </InputGroup.Text>
        </OverlayTrigger>
      )}
      <StringField {...props} />
    </InputGroup>
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);

export const UsernameGroup: FunctionComponent = () => (
  <Form.Group className="mb-7">
    <Form.Label>{translate('Username')}</Form.Label>
    <Field
      name="username"
      validate={validateUsername}
      component={UsernameField}
    />
    <Form.Text muted={true}>
      {translate(
        'Please select a username that you will use for login into the Linux systems.',
      )}
    </Form.Text>
  </Form.Group>
);
