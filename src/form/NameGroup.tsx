import { ENV } from '@/core/config';
import { LATIN_NAME_PATTERN } from '@/core/utils';
import { translate } from '@/i18n';

import { StringGroup } from './index';

export const NameGroup = (props) => (
  <StringGroup
    name="name"
    label={translate('Name')}
    required
    maxLength={150}
    pattern={ENV.enforceLatinName ? LATIN_NAME_PATTERN.source : undefined}
    {...props}
  />
);
