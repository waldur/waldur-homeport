import { SignInIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useMountedState } from 'react-use';
import { reduxForm, Field } from 'redux-form';
import {
  AuthResult,
  authValimoCreate,
  authValimoResult,
} from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { wait } from '@waldur/core/utils';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showError } from '@waldur/store/notify';
import { UsersService } from '@waldur/user/UsersService';

import * as AuthService from '../AuthService';
import { SubmitButton } from '../SubmitButton';

export const AuthValimoDialog = reduxForm({ form: 'AuthValimoDialog' })(({
  submitting,
  invalid,
  handleSubmit,
}) => {
  const [challengeCode, setChallengeCode] = useState<string>();
  const dispatch = useDispatch();
  const router = useRouter();
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

  const parseAuthResult = (result: AuthResult) => {
    if (!isMounted()) {
      return;
    }
    if (result.state === 'OK') {
      AuthService.setAuthHeader(result.token);
      const user = UsersService.getCurrentUser();

      AuthService.loginSuccess({
        data: { ...user, token: result.token, method: 'valimo' },
      });
      router.stateService.go('profile.details');
    } else if (result.state === 'Canceled') {
      if (result.details === 'User is not registered.') {
        dispatch(showError(result.details));
        return;
      }
      const message = translate(
        'Authentication with Mobile ID has been canceled by user or timed out. Details:',
      );
      dispatch(showError(message + result.details));
    } else {
      dispatch(
        showError(
          translate('Unexpected exception happened during login process.'),
        ),
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
      parseAuthResult(authResult);
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to authenticate using Mobile ID.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(authenticateValimo)}>
      <ModalDialog
        title={translate('Authenticate using Mobile ID')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton invalid={invalid} submitting={submitting}>
              <span className="svg-icon svg-icon-2">
                <SignInIcon />
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
            <Field
              type="tel"
              name="phoneNumber"
              required={true}
              component={InputField}
              disabled={submitting}
            />
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
  );
});
