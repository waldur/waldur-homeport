import { SignInIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Form as FinalForm, Field } from 'react-final-form';
import { useMountedState } from 'react-use';
import {
  AuthResult,
  authValimoCreate,
  authValimoResult,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { wait } from '@/core/utils';
import { SubmitButton } from '@/form';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { redirectOnSuccess } from '../authNavigation';
import { loginUser } from '../AuthService';

export const AuthValimoDialog = () => {
  const [challengeCode, setChallengeCode] = useState<string>();
  const { showError, showErrorResponse } = useNotify();
  const isMounted = useMountedState();

  const pollAuthResult = async (authResultId: string) => {
    let result: AuthResult;
    do {
      result = await authValimoResult({ body: { uuid: authResultId } }).then(
        (r) => r.data,
      );
      await wait(2000);
    } while (
      isMounted() &&
      (result.state === 'Scheduled' || result.state === 'Processing')
    );

    return result;
  };

  const parseAuthResult = async (result: AuthResult) => {
    if (!isMounted()) {
      return;
    }
    if (result.state === 'OK') {
      await loginUser(result.token, 'valimo');
      await redirectOnSuccess();
    } else if (result.state === 'Canceled') {
      if (result.details === 'User is not registered.') {
        showError(result.details);
        return;
      }
      const message = translate(
        'Authentication with Mobile ID has been canceled by user or timed out. Details:',
      );
      showError(message + result.details);
    } else {
      showError(
        translate('Unexpected exception happened during login process.'),
      );
    }
  };

  const authenticateValimo = async (formData) => {
    try {
      const { message, uuid } = await authValimoCreate({
        body: {
          phone: ENV.plugins.WALDUR_AUTH_VALIMO.MOBILE_PREFIX.concat(
            formData.phoneNumber,
          ),
        },
      }).then((r) => r.data);
      setChallengeCode(message);
      const authResult = await pollAuthResult(uuid);
      await parseAuthResult(authResult);
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to authenticate using Mobile ID.'),
      );
    }
  };

  return (
    <FinalForm
      onSubmit={authenticateValimo}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Authenticate using Mobile ID')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton invalid={invalid} submitting={submitting}>
                  <span className="svg-icon svg-icon-2">
                    <SignInIcon weight="bold" />
                  </span>{' '}
                  {translate('Sign in')}
                </SubmitButton>
              </>
            }
          >
            <Form.Group>
              <Form.Label>{translate('Mobile phone number')}</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  {ENV.plugins.WALDUR_AUTH_VALIMO.MOBILE_PREFIX}
                </InputGroup.Text>
                <Field name="phoneNumber" required={true}>
                  {({ input, meta }) => (
                    <InputField
                      input={input}
                      meta={meta}
                      type="tel"
                      required={true}
                      disabled={submitting}
                    />
                  )}
                </Field>
              </InputGroup>
            </Form.Group>
            {challengeCode && (
              <Form.Group>
                <Form.Label>{translate('Challenge code')}</Form.Label>
                <p>{challengeCode}</p>
              </Form.Group>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
