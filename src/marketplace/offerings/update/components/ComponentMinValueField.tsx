import React from 'react';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentMinValueField: React.FC = () => (
  <NumberGroup
    name="min_value"
    parse={(value) => Number(value)}
    label={translate('Min value')}
    spaceless
  />
);
