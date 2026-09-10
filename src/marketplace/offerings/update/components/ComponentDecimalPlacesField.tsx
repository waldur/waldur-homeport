import React from 'react';

import { NumberGroup } from '@/form';
import { translate } from '@/i18n';

/**
 * How many decimal places a customer may request for this component's limit.
 *
 * Zero -- the default -- keeps the component whole-number only, which is what
 * every backend that maps a limit onto an integer quota requires. Raising it is
 * refused for plugins that declare they cannot hold a fraction, so the field is
 * offered everywhere and validated server-side rather than hidden per type.
 */
export const ComponentDecimalPlacesField: React.FC = () => (
  <NumberGroup
    name="limit_decimal_places"
    min={0}
    max={2}
    step={1}
    label={translate('Decimal places')}
    description={translate(
      'How many decimal places a customer may use for this limit. 0 keeps it a whole number.',
    )}
    spaceless
  />
);
