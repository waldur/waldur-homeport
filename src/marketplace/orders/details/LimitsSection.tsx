import { isEmpty } from 'lodash';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

export const LimitsSection = ({
  components,
  limits,
}: {
  components: OfferingComponent[];
  limits: Limits;
}) => {
  if (components.length === 0 || isEmpty(limits)) {
    return (
      <Card>
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
          />
        </Card.Body>
      </Card>
    );
  }
  return (
    <Card>
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Limits')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer">
          <thead>
            <tr className="text-start text-muted bg-light fw-bolder fs-7 text-uppercase gs-0">
              <th className="col-sm-1">{translate('Name')}</th>
              <th className="col-sm-1">{translate('Measured unit')}</th>
              <th className="col-sm-1">{translate('Limit')}</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};
