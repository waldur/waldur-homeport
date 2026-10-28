import classNames from 'classnames';
import { FC } from 'react';
import { PlanUsageResponse } from 'waldur-js-client';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

interface OwnProps {
  plansUsage: PlanUsageResponse[];
  className?: string;
  id?: string;
}

const PlanGroup = ({ plan }: { plan: PlanUsageResponse }) => (
  <div>
    <h4 className="font-medium mb-3">{plan.plan_name}:</h4>
    <table className="text-tertiary w-full mb-8">
      <tbody>
        <tr>
          <th className="w-1/2 text-secondary font-medium">
            {translate('Active count')}:
          </th>
          <td>{plan.usage}</td>
        </tr>
        <tr>
          <th className="w-1/2 text-secondary font-medium">
            {translate('Limit')}:
          </th>
          <td>{renderFieldOrDash(plan.limit)}</td>
        </tr>
        <tr>
          <th className="w-1/2 text-secondary font-medium">
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
    <div
      className={classNames('card card-bordered', props.className)}
      id={props.id}
    >
      <div className="card-header">
        <div className="card-title">{translate('Plans')}</div>
      </div>
      <div className="card-body">
        {!props.plansUsage?.length && (
          <div className="text-quaternary">
            {translate('There are no plans')}
          </div>
        )}
        {props.plansUsage &&
          props.plansUsage.map((plan) => (
            <PlanGroup key={plan.plan_uuid} plan={plan} />
          ))}
      </div>
    </div>
  );
};
