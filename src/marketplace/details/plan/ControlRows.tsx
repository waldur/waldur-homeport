import { PublicOfferingDetails, Offering } from 'waldur-js-client';

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
}) =>
  props.viewMode || props.readOnlyLimits ? (
    <FixedRows
      components={props.components}
      hidePrices={props.hidePrices}
      period={props.period}
      activePriceIndex={props.activePriceIndex}
    />
  ) : (
    <>
      {props.components.map((component, index) => (
        <ComponentEditRow2
          key={index}
          component={component}
          hidePrices={props.hidePrices}
          period={props.period}
          activePriceIndex={props.activePriceIndex}
          offering={props.offering}
        />
      ))}
    </>
  );
