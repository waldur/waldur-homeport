import { FunctionComponent, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { FormContainer, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';

export const SLURMSecretOptionsForm: FunctionComponent<{ container }> = ({
  container,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      change(
        FORM_ID,
        'secret_options.service_provider_can_create_offering_user',
        true,
      ),
    );
  }, [dispatch]);

  return (
    <FormContainer {...container}>
      <AwesomeCheckboxField
        name="service_provider_can_create_offering_user"
        label={translate('Service provider can create offering user')}
        hideLabel
      />
      <StringField
        name="shared_user_password"
        label={translate('Shared user password')}
        description={translate(
          'If defined, will be set as a password for all offering users',
        )}
      />
    </FormContainer>
  );
};
