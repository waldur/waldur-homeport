import { useEffect, useCallback } from 'react';
import { Col, FormGroup } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { reduxForm, change } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { translate } from '@waldur/i18n';
import { showSuccess, showError } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { createProfile } from './api';
import { TosGroup } from './TosGroup';
import { UsernameGroup } from './UsernameGroup';

const FORM_ID = 'FreeIPAAccountCreate';

interface FreeIPAAccountCreateFormData {
  username: string;
  agree_with_policy: boolean;
}

interface FreeIPAAccountCreateOwnProps {
  onProfileAdded(): void;
}

export const FreeIPAAccountCreate = reduxForm<
  FreeIPAAccountCreateFormData,
  FreeIPAAccountCreateOwnProps
>({ form: FORM_ID })(
  ({ invalid, submitting, handleSubmit, onProfileAdded }) => {
    const dispatch = useDispatch();
    const user = useSelector(getUser);

    useEffect(() => {
      dispatch(change(FORM_ID, 'username', user.username));
    }, [user, dispatch]);

    const callback = useCallback(
      async (formData) => {
        try {
          await createProfile(formData.username, formData.agree_with_policy);
          dispatch(showSuccess(translate('A profile has been created.')));
          onProfileAdded();
        } catch (response) {
          if (response.data && response.data.username) {
            dispatch(showError(response.data.username));
          }
          dispatch(showError(translate('Unable to create a FreeIPA profile.')));
        }
      },
      [dispatch, onProfileAdded],
    );

    return (
      <form className="form-horizontal" onSubmit={handleSubmit(callback)}>
        <UsernameGroup />
        <TosGroup />
        <FormGroup>
          <Col smOffset={3} sm={5}>
            <SubmitButton
              submitting={submitting}
              invalid={invalid}
              block={false}
            >
              <i className="fa fa-plus" /> {translate('Create')}
            </SubmitButton>
          </Col>
        </FormGroup>
      </form>
    );
  },
);
