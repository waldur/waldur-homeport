import classNames from 'classnames';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { PlanUsageResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

interface OwnProps {
  plansUsage: PlanUsageResponse[];
  className?: string;
  id?: string;
}

const PlanGroup = ({ plan }: { plan: PlanUsageResponse }) => (
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
          <td>{renderFieldOrDash(plan.limit)}</td>
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
    <Card
      className={classNames('card-bordered', props.className)}
      id={props.id}
    >
      <Card.Header>
        <Card.Title>{translate('Plans')}</Card.Title>
      </Card.Header>
      <Card.Body>
        {!props.plansUsage?.length && (
          <div className="text-muted">{translate('There are no plans')}</div>
        )}
        {props.plansUsage &&
          props.plansUsage.map((plan) => (
            <PlanGroup key={plan.plan_uuid} plan={plan} />
          ))}
      </Card.Body>
    </Card>
  );
};
