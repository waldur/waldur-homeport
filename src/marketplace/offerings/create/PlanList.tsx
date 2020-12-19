import { FunctionComponent } from 'react';

import { PlanSummary } from './PlanSummary';

export const PlanList: FunctionComponent<{ title; plans; components }> = ({
  title,
  plans,
  components,
}) =>
  plans.length > 0 ? (
    <>
      <h4>{title}</h4>
      {plans.map((plan, index) => (
        <PlanSummary key={index} plan={plan} components={components} />
      ))}
    </>
  ) : null;
