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
      >
        {translate('Quantity')}: {component.amount}x
      </ComponentRow2>
    ))}
  </>
);
