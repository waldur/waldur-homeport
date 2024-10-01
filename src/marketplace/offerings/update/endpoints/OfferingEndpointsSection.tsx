import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddEndpointButton } from './AddEndpointButton';
import { DeleteEndpointButton } from './DeleteEndpointButton';

export const OfferingEndpointsSection: FC<OfferingSectionProps> = (props) => {
  return (
    <Card>
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          <span className="me-2">{translate('Endpoints')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        <div className="card-toolbar">
          <AddEndpointButton {...props} />
        </div>
      </Card.Header>
      <Card.Body>
        {props.offering.endpoints.length === 0 ? (
          <NoResult
            callback={props.refetch}
            title={translate('No endpoints found')}
            message={translate("Offering doesn't have endpoints.")}
            buttonTitle={translate('Search again')}
            className="mt-n5"
          />
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
