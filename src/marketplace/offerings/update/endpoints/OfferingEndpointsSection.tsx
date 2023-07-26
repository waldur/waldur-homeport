import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { AddEndpointButton } from './AddEndpointButton';
import { DeleteEndpointButton } from './DeleteEndpointButton';

export const OfferingEndpointsSection = (props) => {
  return (
    <Card className="mb-10">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">{translate('Endpoints')}</div>
        <div className="card-toolbar">
          <AddEndpointButton {...props} />
        </div>
      </div>
      <Card.Body>
        {props.offering.endpoints.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">
                {translate("Offering doesn't have endpoints.")}
              </p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {props.offering.endpoints.map((endpoint) => (
                <tr key={endpoint.uuid}>
                  <td className="col-md-3">{endpoint.name}</td>
                  <td className="col-md-9">{endpoint.url}</td>
                  <td className="row-actions">
                    <div>
                      <DeleteEndpointButton
                        offering={props.offering}
                        endpoint={endpoint}
                        refetch={props.refetch}
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
