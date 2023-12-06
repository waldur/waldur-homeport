import { isEmpty } from 'lodash';
import { Accordion } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Limits } from '@waldur/marketplace/common/registry';
import { OfferingComponent } from '@waldur/marketplace/types';

export const LimitsSection = ({
  components,
  limits,
}: {
  components: OfferingComponent[];
  limits: Limits;
}) => {
  if (components.length === 0 || isEmpty(limits)) {
    return null;
  }
  return (
    <Accordion.Item eventKey="limits">
      <Accordion.Header>{translate('Limits')}</Accordion.Header>
      <Accordion.Body>
        <table className="table table-bordered">
          <thead>
            <tr>
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
      </Accordion.Body>
    </Accordion.Item>
  );
};
