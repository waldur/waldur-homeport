import { FunctionComponent, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Field, change, formValueSelector } from 'redux-form';

import { StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';

import { EDIT_INTEGRATION_FORM_ID } from './offerings/update/integration/constants';

const FIELD_NAME = 'secret_options.service_provider_can_create_offering_user';

export const canCreateUserSelector = (state) =>
  formValueSelector(EDIT_INTEGRATION_FORM_ID)(state, FIELD_NAME);

export const UserSecretOptionsForm: FunctionComponent<{}> = () => {
  const dispatch = useDispatch();
  const canCreateUser = useSelector(canCreateUserSelector);

  useEffect(() => {
    if (canCreateUser === undefined) {
      dispatch(change(EDIT_INTEGRATION_FORM_ID, FIELD_NAME, true));
    }
  }, [dispatch, canCreateUser]);

  return (
    <>
      <Field
        component={AwesomeCheckboxField}
        name="service_provider_can_create_offering_user"
        label={translate('Service provider can create offering user')}
        className="mt-3"
      />
      {canCreateUser && (
        <>
          <Form.Label className="mt-3">
            {translate('Shared user password')}
          </Form.Label>
          <Field component={StringField} name="shared_user_password" />
          <Form.Text muted={true}>
            {translate(
              'If defined, will be set as a password for all offering users',
            )}
          </Form.Text>
        </>
      )}
    </>
  );
};
