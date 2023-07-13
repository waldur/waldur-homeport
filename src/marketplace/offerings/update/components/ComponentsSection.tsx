import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { showComponentsList } from '@waldur/marketplace/common/registry';
import { getBillingTypeLabel } from '@waldur/marketplace/resources/usage/utils';

import { AddComponentButton } from './AddComponentButton';
import { DeleteComponentButton } from './DeleteComponentButton';
import { EditComponentButton } from './EditComponentButton';

export const ComponentsSection = (props) => {
  if (!showComponentsList(props.offering.type)) {
    return null;
  }
  return (
    <Card className="mb-10">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          {props.offering.components.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          {translate('Accounting components')}
        </div>
        {!props.components.length && (
          <div className="card-toolbar">
            <AddComponentButton {...props} />
          </div>
        )}
      </div>
      <Card.Body>
        {props.offering.components.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">
                {translate("Offering doesn't have components.")}
              </p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {props.offering.components.map((component, componentIndex) => (
                <tr key={componentIndex}>
                  <td className="col-md-3">{component.name}</td>
                  <td className="col-md-3">{component.measured_unit}</td>
                  <td className="col-md-3">
                    {getBillingTypeLabel(component.billing_type)}
                  </td>
                  <td className="row-actions">
                    <div>
                      <EditComponentButton
                        offering={props.offering}
                        refetch={props.refetch}
                        component={component}
                      />
                      <DeleteComponentButton
                        offering={props.offering}
                        component={component}
                      />
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
};
