import { Field } from 'react-final-form';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useUser } from '@waldur/workspace/hooks';

export const SlugGroup = () => {
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  return (
    <FormGroup
      label={translate('Project slug')}
      help={translate(
        'Warning: The slug will be used for external integrations and APIs. Choose carefully as changing it later may break dependent systems.',
      )}
    >
      <Field component={StringField as any} name="slug" />
    </FormGroup>
  );
};
