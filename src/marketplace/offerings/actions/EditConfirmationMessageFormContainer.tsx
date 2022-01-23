import { FunctionComponent } from 'react';

import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';

interface EditConfirmationMessageFormContainerProps {
  submitting: boolean;
  layout?: 'horizontal' | 'vertical';
}

export const EditConfirmationMessageFormContainer: FunctionComponent<EditConfirmationMessageFormContainerProps> =
  ({ submitting, layout }) => (
    <FormContainer
      submitting={submitting}
      labelClass={layout === 'vertical' ? '' : 'col-sm-2'}
      controlClass={layout === 'vertical' ? '' : 'col-sm-8'}
    >
      <TextField
        label={translate('Confirmation notification template')}
        name="template_confirmation_comment"
      />
    </FormContainer>
  );

EditConfirmationMessageFormContainer.defaultProps = {
  layout: 'horizontal',
};
