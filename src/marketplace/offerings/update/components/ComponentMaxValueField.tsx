import React from 'react';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

export const ComponentMaxValueField: React.FC = () => (
  <NumberGroup
    name="max_value"
    id="max_value"
    parse={(value) => Number(value)}
    label={translate('Max value')}
    controlId="max_value"
    spaceless
  />
);
