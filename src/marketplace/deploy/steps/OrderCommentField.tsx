import { Field } from 'redux-form';

import { FormGroup, StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';

export const OrderCommentField = () => (
  <Field
    name="request_comment"
    component={FormGroup}
    maxLength={255}
    label={translate('Comment')}
  >
    <StringField placeholder={translate('Enter a comment...')} />
  </Field>
);
