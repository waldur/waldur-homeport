import { FunctionComponent } from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

interface EditConfirmationMessageFormContainerProps {
  submitting: boolean;
}

export const EditConfirmationMessageFormContainer: FunctionComponent<EditConfirmationMessageFormContainerProps> =
  ({ submitting }) => (
    <FormContainer submitting={submitting}>
      <TextField
        label={translate('Confirmation notification template')}
        name="template_confirmation_comment"
      />
    </FormContainer>
  );
