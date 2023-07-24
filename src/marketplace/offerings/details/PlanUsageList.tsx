import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { PlanUsageRow } from '@waldur/marketplace/resources/plan-usage/types';

interface OwnProps {
  plansUsage: PlanUsageRow[];
  className?: string;
}

const PlanGroup = ({ plan }: { plan: PlanUsageRow }) => (
  <div className="plan">
    <h4 className="fw-bold mb-4">{plan.plan_name}:</h4>
    <table className="text-gray-600 w-100 mb-10">
      <tbody>
        <tr>
          <th className="w-50 text-gray-700 fw-bold">
            {translate('Active count')}:
          </th>
          <td>{plan.usage}</td>
        </tr>
        <tr>
          <th className="w-50 text-gray-700 fw-bold">{translate('Limit')}:</th>
          <td>{plan.limit || 'N/A'}</td>
        </tr>
        <tr>
          <th className="w-50 text-gray-700 fw-bold">
            {translate('Remaining')}:
          </th>
          <td>{plan.remaining === null ? 'N/A' : plan.remaining}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const PlanUsageList: FC<OwnProps> = (props) => {
  return (
    <Card className={props.className}>
      <Card.Body>
        <div className="d-flex">
          <div className="flex-grow-1">
            <h3>{translate('Plans')}</h3>
          </div>
        </div>
        {!props.plansUsage?.length && (
          <div className="text-muted">{translate('There is no plan')}</div>
        )}
        {props.plansUsage &&
          props.plansUsage.map((plan) => (
            <PlanGroup key={plan.plan_uuid} plan={plan} />
          ))}
      </Card.Body>
    </Card>
  );
};
