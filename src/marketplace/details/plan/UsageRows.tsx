import { Component, PlanPeriod } from './types';
import { UsageComponentRow } from './UsageComponentRow';

export const UsageRows = (props: {
  components: Component[];
  hidePrices?: boolean;
  period?: PlanPeriod;
}) => (
  <>
    {props.components.map((component, index) => (
      <UsageComponentRow
        key={index}
        offeringComponent={component}
        hidePrices={props.hidePrices}
        period={props.period}
      />
    ))}
  </>
);
