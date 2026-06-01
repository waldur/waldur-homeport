import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

export const DisplayNameField = () => (
  <StringGroup
    label={translate('Display name')}
    required={true}
    help={translate('Label that is visible to users in Marketplace.')}
    helpEnd
    space={5}
    name="label"
    validate={required}
  />
);
