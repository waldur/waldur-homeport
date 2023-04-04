import { Field } from 'redux-form';

import { TextField } from '@waldur/form';
import { validateMaxLength } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';

export const CustomMessageInput = () => {
  return (
    <>
      <h2 className="mb-6">{translate('Custom message')}</h2>
      <p className="mb-6">
        {translate(
          'You can add a message to be attached to the invitation email the users receives.',
        )}
      </p>
      <Field
        name="extra_invitation_text"
        component={TextField}
        validate={[validateMaxLength]}
        placeholder={translate('Enter your custom message')}
      />
    </>
  );
};
