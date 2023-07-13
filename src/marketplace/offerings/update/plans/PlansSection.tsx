import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { hidePlanAddButton } from '@waldur/marketplace/common/registry';

import { AddPlanButton } from './AddPlanButton';
import { ArchivePlanButton } from './ArchivePlanButton';
import { EditPlanButton } from './EditPlanButton';

export const PlansSection = (props) => (
  <Card className="mb-10">
    <div className="border-2 border-bottom card-header">
      <div className="card-title h5">
        {props.offering.plans.length === 0 ? (
          <i className="fa fa-warning text-danger me-3" />
        ) : (
          <i className="fa fa-check text-success me-3" />
        )}
        {translate('Accounting plans')}
      </div>
      {!hidePlanAddButton(props.offering.type, props.offering.plans) && (
        <div className="card-toolbar">
          <AddPlanButton {...props} />
        </div>
      )}
    </div>
    <Card.Body>
      {props.offering.plans.length === 0 ? (
        <div className="justify-content-center row">
          <div className="col-sm-4">
            <p className="text-center">
              {translate("Offering doesn't have plans.")}
            </p>
          </div>
        </div>
      ) : (
        <Table bordered={true} hover={true} responsive={true}>
          <tbody>
            {props.offering.plans.map((plan, planIndex) => (
              <tr key={planIndex}>
                <td className="col-md-3">{plan.name}</td>
                <td className="col-md-3">
                  {plan.archived ? translate('Archived') : translate('Active')}
                </td>
                <td className="row-actions">
                  <div>
                    <EditPlanButton {...props} plan={plan} />
                    <ArchivePlanButton {...props} plan={plan} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card.Body>
  </Card>
);
