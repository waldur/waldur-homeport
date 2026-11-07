import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';

interface OwnProps {
  plansUsage: PlanUsageResponse[];
  className?: string;
  id?: string;
}

const PlanGroup = ({ plan }: { plan: PlanUsageResponse }) => (
  <div>
    <h4 className="font-medium mb-3">{plan.plan_name}:</h4>
    <table className="text-tertiary mb-8">
      <tbody>
        <tr>
          <th className="text-secondary font-medium pe-5">
            {translate('Active count')}:
          </th>
          <td>{plan.usage}</td>
        </tr>
        <tr>
          <th className="text-secondary font-medium pe-5">
            {translate('Limit')}:
          </th>
          <td>{renderFieldOrDash(plan.limit)}</td>
        </tr>
        <tr>
          <th className="text-secondary font-medium pe-5">
            {translate('Remaining')}:
          </th>
          <td>{plan.remaining === null ? DASH_ESCAPE_CODE : plan.remaining}</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export const PlanUsageList: FC<OwnProps> = (props) => {
  return (
    <Card bordered className={props.className} id={props.id}>
      <CardHeader>
        <CardTitle as="div">{translate('Plans')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!props.plansUsage?.length && (
          <div className="text-quaternary">
            {translate('There are no plans')}
          </div>
        )}
        {props.plansUsage &&
          props.plansUsage.map((plan) => (
            <PlanGroup key={plan.plan_uuid} plan={plan} />
          ))}
      </CardContent>
    </Card>
  );
};
