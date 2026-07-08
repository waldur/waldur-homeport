import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { Component } from './types';

export const ComponentCost = ({ component }: { component: Component }) => (
  <>
    {translate('Cost: {cost}', {
      cost: component.measured_unit
        ? translate('{price} per {unit}', {
            price: defaultCurrency(component.price),
            unit: component.measured_unit,
          })
        : defaultCurrency(component.price),
    })}
    {component.discountApplied && component.discountPercent ? (
      <span className="ms-2 text-success">
        {'− '}
        {translate('{percent}% volume discount', {
          percent: component.discountPercent,
        })}
      </span>
    ) : component.discountDeferred ? (
      <span className="ms-2 text-muted">
        {translate('Volume discount applied on your invoice')}
      </span>
    ) : null}
  </>
);
