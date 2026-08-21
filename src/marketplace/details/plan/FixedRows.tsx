import { translate } from '@/i18n';

import { ComponentRow2 } from './ComponentRow';
import { Component, PlanPeriod } from './types';

export const FixedRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
}) => (
  <>
    {props.components.map((component, index) => (
      <ComponentRow2
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
        activePriceIndex={props.activePriceIndex}
        // A quantity of 0 here would be the fallback, not an included amount,
        // so neither the quantity nor a total can be stated yet.
        hideTotal={component.quantityUnknown}
      >
        {component.quantityUnknown ? (
          translate('Chosen at order time')
        ) : (
          <>
            {translate('Quantity')}: {component.amount}x
          </>
        )}
      </ComponentRow2>
    ))}
  </>
);
