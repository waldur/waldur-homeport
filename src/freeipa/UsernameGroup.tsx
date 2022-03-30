import { FunctionComponent } from 'react';
import {
  Col,
  Form,
  InputGroup,
  OverlayTrigger,
  Tooltip as BootstrapTooltip,
} from 'react-bootstrap';
import { Field, WrappedFieldProps } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { FieldError } from '@waldur/form';
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
    MAXIMUM_USERNAME_LENGTH - ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX.length
  ) {
    return translate(
      'Maximum username length with mandatory username prefix is 32 characters.',
    );
  }
};

const UsernameField: FunctionComponent<WrappedFieldProps> = (props) => (
  <>
    <InputGroup className="m-b-sm">
      {ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX && (
        <OverlayTrigger
          placement="top"
          overlay={
            <BootstrapTooltip id="freeipa-username-prefix">
              {translate('Username prefix')}
            </BootstrapTooltip>
          }
        >
          <InputGroup.Text>
            {ENV.plugins.WALDUR_FREEIPA.USERNAME_PREFIX}
          </InputGroup.Text>
        </OverlayTrigger>
      )}
      <InputField {...props} />
    </InputGroup>
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);

export const UsernameGroup: FunctionComponent = () => (
  <Form.Group>
    <Col sm={3} as={Form.Label}>
      {translate('Username')}
    </Col>
    <Col sm={6}>
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
    </Col>
  </Form.Group>
);
