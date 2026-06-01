import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { FIELD_TYPES } from './constants';

export const OptionTypeGroup = () => (
  <SelectGroup
    name="type"
    label={translate('Type')}
    required={true}
    validate={required}
    options={FIELD_TYPES}
    isClearable={false}
  />
);
