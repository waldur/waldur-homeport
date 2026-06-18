import { FunctionComponent } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentBooleanDefaultLimitField: FunctionComponent = () => (
  <BooleanGroup
    name="default_limit"
    label={translate('Enable by default')}
    parse={(v) => (v ? 1 : 0)}
    format={Boolean}
    size="sm"
    alignMiddle
    space={5}
  />
);
