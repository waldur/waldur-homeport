import { FC } from 'react';

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
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title h5">
          <span className="me-1.5">{translate('Endpoints')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </div>
        {canAdd && (
          <div className="card-toolbar">
            <AddEndpointButton {...props} />
          </div>
        )}
      </div>
      <div className="card-body">
        {props.offering.endpoints.length === 0 ? (
          <NoResult
            callback={props.refetch}
            title={translate('No endpoints found')}
            message={translate("Offering doesn't have endpoints.")}
            buttonTitle={translate('Search again')}
            className="-mt-4"
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
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
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
