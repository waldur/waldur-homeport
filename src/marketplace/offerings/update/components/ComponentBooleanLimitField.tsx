import { FunctionComponent } from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentBooleanLimitField: FunctionComponent = () => (
  <BooleanGroup
    name="is_boolean"
    label={translate('Allow to enable/disable component only')}
    size="sm"
    alignMiddle
    space={5}
  />
);
