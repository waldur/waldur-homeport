import { PublicOfferingDetails } from 'waldur-js-client';

import { ComponentEditRow2 } from './ComponentEditRow';
import { FixedRows } from './FixedRows';
import { Component, PlanPeriod } from './types';

export const ControlRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  viewMode: boolean;
  period?: PlanPeriod;
  activePriceIndex?: number;
  offering: PublicOfferingDetails;
}) =>
  props.viewMode ? (
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
