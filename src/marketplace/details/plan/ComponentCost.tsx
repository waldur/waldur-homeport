import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';

import { Component } from './types';

export const ComponentCost = ({ component }: { component: Component }) => (
  <>
    {translate('Cost') +
      ': ' +
      (component.measured_unit
        ? translate('{price} per {unit}', {
            price: defaultCurrency(component.price),
            unit: component.measured_unit,
          })
        : defaultCurrency(component.price))}
  </>
);
