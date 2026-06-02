import { FC } from 'react';
import { Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Field, FieldRenderProps } from 'react-final-form';

import { ENV } from '@/core/config';
import { FieldError } from '@/form';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';

// These limitations are imposed by underlying operating system
const MAXIMUM_USERNAME_LENGTH = 32;
const USERNAME_PATTERN = new RegExp(
  '^[a-zA-Z0-9_.][a-zA-Z0-9_.-]*[a-zA-Z0-9_.$-]?$',
);

export const validateUsername = (username: string) => {
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
    MAXIMUM_USERNAME_LENGTH -
      ENV.plugins.WALDUR_CORE.FREEIPA_USERNAME_PREFIX.length
  ) {
    return translate(
      'Maximum username length with mandatory username prefix is 32 characters.',
    );
  }
};

interface UsernameFieldProps extends FieldRenderProps<string> {
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

const UsernameField: FC<UsernameFieldProps> = ({
  input,
  meta,
  placeholder = '  ',
  autoFocus,
  disabled,
  'data-testid': testId,
}) => (
  <>
    <InputGroup className="mb-2">
      {ENV.plugins.WALDUR_CORE.FREEIPA_USERNAME_PREFIX && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="freeipa-username-prefix">
              {translate('Username prefix')}
            </Tooltip>
          }
        >
          <InputGroup.Text>
            {ENV.plugins.WALDUR_CORE.FREEIPA_USERNAME_PREFIX}
          </InputGroup.Text>
        </OverlayTrigger>
      )}
      <Form.Control
        type="text"
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        data-testid={testId}
        isInvalid={meta.touched && !!meta.error}
        {...input}
      />
    </InputGroup>
    {meta.touched && meta.error && <FieldError error={meta.error} />}
  </>
);

interface UsernameGroupProps {
  name?: string;
  label?: string;
  description?: string;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  'data-testid'?: string;
}

export const UsernameGroup: FC<UsernameGroupProps> = ({
  name = 'username',
  label = translate('Username'),
  description = translate(
    'Please select a username that you will use for login into the Linux systems.',
  ),
  required = true,
  autoFocus,
  disabled,
  'data-testid': testId,
}) => (
  <FormGroup label={label} help={description} required={required}>
    <Field
      name={name}
      validate={required ? validateUsername : undefined}
      component={UsernameField}
      placeholder="Enter username"
      autoFocus={autoFocus}
      disabled={disabled}
      data-testid={testId}
    />
  </FormGroup>
);
