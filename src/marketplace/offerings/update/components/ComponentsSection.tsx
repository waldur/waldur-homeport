import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { showComponentsList } from '@waldur/marketplace/common/registry';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { getBillingTypeLabel } from '@waldur/marketplace/resources/usage/utils';

import { OfferingSectionProps } from '../types';

import { AddComponentButton } from './AddComponentButton';
import { DeleteComponentButton } from './DeleteComponentButton';
import { EditComponentButton } from './EditComponentButton';
import { RefreshButton } from './RefreshButton';

export const ComponentsSection: FC<OfferingSectionProps & { components }> = (
  props,
) => {
  if (!showComponentsList(props.offering.type)) {
    return null;
  }
  return (
    <Card id="components">
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          <ValidationIcon value={props.offering.components.length > 0} />
          <span className="me-2">{translate('Accounting components')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        {!props.components.length && (
          <div className="card-toolbar">
            <AddComponentButton {...props} />
          </div>
        )}
      </Card.Header>
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
