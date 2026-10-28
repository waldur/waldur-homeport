import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddEndpointButton } from './AddEndpointButton';
import { DeleteEndpointButton } from './DeleteEndpointButton';
import { EditEndpointButton } from './EditEndpointButton';

export const OfferingEndpointsSection: FC<OfferingSectionProps> = (props) => {
  const user = useUser();
  const can = (permission: string) =>
    hasPermission(user, {
      permission,
      customerId: props.offering.customer_uuid,
      offeringId: props.offering.uuid,
    });
  const canAdd = can(PermissionEnum.ADD_OFFERING_ENDPOINT);
  const canUpdate = can(PermissionEnum.UPDATE_OFFERING_ENDPOINT);
  const canDelete = can(PermissionEnum.DELETE_OFFERING_ENDPOINT);

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title className="h5">
          <span className="me-1.5">{translate('Endpoints')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        {canAdd && (
          <div className="card-toolbar">
            <AddEndpointButton {...props} />
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {props.offering.endpoints.length === 0 ? (
          <NoResult
            callback={props.refetch}
            title={translate('No endpoints found')}
            message={translate("Offering doesn't have endpoints.")}
            buttonTitle={translate('Search again')}
            className="-mt-4"
          />
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {props.offering.endpoints.map((endpoint) => (
                <tr key={endpoint.uuid}>
                  <td className="md:w-3/12">{endpoint.name}</td>
                  <td className="md:w-9/12">{endpoint.url}</td>
                  {(canUpdate || canDelete) && (
                    <td className="row-actions">
                      <div className="flex gap-1.5">
                        {canUpdate && (
                          <EditEndpointButton
                            offering={props.offering}
                            endpoint={endpoint}
                            refetch={props.refetch}
                          />
                        )}
                        {canDelete && (
                          <DeleteEndpointButton
                            offering={props.offering}
                            endpoint={endpoint}
                            refetch={props.refetch}
                          />
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
