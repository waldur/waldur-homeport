import React from 'react';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentLimitEnableField: React.FC = () => (
  <BooleanGroup
    label={translate('Enable limit')}
    name="limit_amount"
    format={(v) => v !== null && typeof v != 'undefined'}
    parse={(v) => (v ? 0 : null)}
    size="sm"
    alignMiddle
    space={5}
  />
);
