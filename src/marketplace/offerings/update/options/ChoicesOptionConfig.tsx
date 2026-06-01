import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

export const ChoicesOptionConfig = () => (
  <StringGroup
    label={translate('Choices as comma-separated list')}
    required={true}
    name="choices"
    validate={required}
  />
);
