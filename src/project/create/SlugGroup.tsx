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
    <FormGroup label={translate('Project slug')}>
      <Field component={StringField as any} name="slug" />
    </FormGroup>
  );
};
