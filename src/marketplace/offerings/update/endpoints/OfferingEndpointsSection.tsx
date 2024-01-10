import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddEndpointButton } from './AddEndpointButton';
import { DeleteEndpointButton } from './DeleteEndpointButton';

export const OfferingEndpointsSection: FC<OfferingSectionProps> = (props) => {
  return (
    <Card className="mb-10" id="endpoints">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          <span className="me-2">{translate('Endpoints')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </div>
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
