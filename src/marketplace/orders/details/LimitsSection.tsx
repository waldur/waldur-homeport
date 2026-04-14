import { isEmpty } from 'lodash-es';
import { Card } from 'react-bootstrap';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/types';
import { OrderFieldEditButton } from '@waldur/marketplace/orders/details/OrderFieldEditButton';
import { OfferingComponent } from '@waldur/marketplace/types';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { useOrderEditable } from './hooks';

export const LimitsSection = ({
  components,
  limits,
  order,
  offering,
}: {
  components: OfferingComponent[];
  limits: Limits;
  order?: OrderDetails;
  offering?: PublicOfferingDetails;
}) => {
  const editable = useOrderEditable(order);
  if (components.length === 0 || isEmpty(limits)) {
    return (
      <Card className="card-bordered">
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Limits')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <NoResult
            title={translate('No limits found for this order')}
            buttonTitle={null}
            message={null}
            noAction
          />
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card className="card-bordered">
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Limits')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <table className="table align-middle table-row-bordered fs-6 gy-4 no-footer">
          <thead>
            <tr className="align-middle">
              <th className="col-sm-1">{translate('Name')}</th>
              <th className="col-sm-1">{translate('Measured unit')}</th>
              <th className="col-sm-1">{translate('Limit')}</th>
              {editable && <th className="col-sm-1">{translate('Actions')}</th>}
            </tr>
          </thead>

          <tbody>
            {components.map((component, id) => (
              <tr key={id}>
                <td className="col-sm-1 text-capitalize">{component.name}</td>
                <td className="col-sm-1 text-capitalize">
                  {component.measured_unit}
                </td>
                <td className="col-sm-1 text-capitalize">
                  {limits[component.type]}
                </td>
                {editable && (
                  <td className="col-sm-1">
                    <OrderFieldEditButton
                      order={order}
                      offering={offering}
                      name="limits"
                      component={component.type}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};
