import { Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { PlanActions } from './PlanActions';

export const PlansTable = ({ plans, offering, refetch, user }) => (
  <Table bordered={true} hover={true}>
    <tbody>
      {plans.map((plan, planIndex) => (
        <tr key={planIndex}>
          <td className="col-md-3">{plan.name}</td>
          <td className="col-md-1">
            {plan.archived ? translate('Archived') : translate('Active')}
          </td>
          <td className="col-md-2">
            {plan.resources_count === 0
              ? translate('Not used')
              : plan.resources_count === 1
                ? translate('Used by one resource')
                : translate('Used by {count} resources', {
                    count: plan.resources_count,
                  })}
          </td>
          <td className="row-actions">
            <PlanActions
              offering={offering}
              plan={plan}
              refetch={refetch}
              user={user}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);
