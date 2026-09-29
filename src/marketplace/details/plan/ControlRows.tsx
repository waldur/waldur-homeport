import { useMemo } from 'react';
import { PublicOfferingDetails, Offering } from 'waldur-js-client';

import { getDerivedComponents } from '@/marketplace/common/derivedLimits';

import { ComponentEditRow2 } from './ComponentEditRow';
import { FixedRows } from './FixedRows';
import { Component, PlanPeriod } from './types';

export const ControlRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  viewMode: boolean;
  /**
   * Show the quantities without inputs. For a form that already owns them in
   * a step of its own, so the plan reads as a price breakdown of that step
   * rather than a second place to type the same number.
   */
  readOnlyLimits?: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
  offering: PublicOfferingDetails | Offering;
}) => {
  // Quantities an order-form option calculates are shown, not typed: the
  // server would replace a typed value anyway.
  const derived = useMemo(
    () => getDerivedComponents(props.offering?.options?.options),
    [props.offering],
  );
  return props.viewMode || props.readOnlyLimits ? (
    <FixedRows
      components={props.components}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
    />
  ) : (
    <>
      {props.components.map((component, index) =>
        derived.has(component.type) ? (
          <FixedRows
            key={index}
            components={[component]}
            hidePrices={props.hidePrices}
            period={props.period}
            activePriceIndex={props.activePriceIndex}
          />
        ) : (
          <ComponentEditRow2
            key={index}
            component={component}
            hidePrices={props.hidePrices}
            period={props.period}
            activePriceIndex={props.activePriceIndex}
            offering={props.offering}
          />
        ),
      )}
    </>
  );
};
