import React from 'react';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';

export const ComponentLimitAmountField: React.FC = () => (
  <NumberGroup
    name="limit_amount"
    min={0}
    parse={parseIntField}
    format={formatIntField}
    label={translate('Limit amount')}
    spaceless
  />
);
