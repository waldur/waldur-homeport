import { Field } from 'redux-form';

import {
  FormContainer,
  NumberField,
  SecretField,
  StringField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';

export const ZammadSettings = () => (
  <FormContainer submitting={false} clearOnUnmount={false} floating={true}>
    <StringField
      name="ZAMMAD_API_URL"
      label={translate('API URL')}
      maxLength={150}
    />
    <Field
      name="ZAMMAD_TOKEN"
      type="password"
      label={translate('Token')}
      maxLength={150}
      component={SecretField}
    />
    <StringField
      floating={false}
      name="ZAMMAD_GROUP"
      label={translate('Zammad group')}
      placeholder={translate(
        'The name of the group to which the ticket will be added',
      )}
      maxLength={150}
    />
    <StringField
      name="ZAMMAD_ARTICLE_TYPE"
      label={translate('Type of a comment')}
      maxLength={150}
    />
    <StringField
      name="ZAMMAD_COMMENT_MARKER"
      label={translate('Marker for comment')}
      maxLength={150}
    />
    <StringField
      name="ZAMMAD_COMMENT_PREFIX"
      label={translate('Comment prefix')}
      maxLength={150}
    />
    <NumberField
      name="ZAMMAD_COMMENT_COOLDOWN_DURATION"
      label={translate('Comment cooldown duration')}
      min={1}
    />
  </FormContainer>
);
