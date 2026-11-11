import { FC } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'waldur-ui';

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
    <Card bordered>
      <CardHeader>
        <CardTitle as="div" className="h5">
          <span className="me-1.5">{translate('Endpoints')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </CardTitle>
        {canAdd && (
          <CardToolbar>
            <AddEndpointButton {...props} />
          </CardToolbar>
        )}
      </CardHeader>
      <CardContent>
        {props.offering.endpoints.length === 0 ? (
          <NoResult
            callback={props.refetch}
            title={translate('No endpoints found')}
            message={translate("Offering doesn't have endpoints.")}
            buttonTitle={translate('Search again')}
            className="-mt-4"
          />
        ) : (
          <Table density="compact">
            <TableBody>
              {props.offering.endpoints.map((endpoint) => (
                <TableRow key={endpoint.uuid}>
                  <TableCell className="md:w-3/12">{endpoint.name}</TableCell>
                  <TableCell className="md:w-9/12">{endpoint.url}</TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell>
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
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
