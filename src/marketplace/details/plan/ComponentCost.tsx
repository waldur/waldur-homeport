import classNames from 'classnames';

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
    {component.discountDescription && (
      <span
        className={classNames(
          'ms-2',
          component.discountApplied ? 'text-success' : 'text-muted',
        )}
      >
        {' | '}
        {component.discountDescription}
      </span>
    )}
  </>
);
