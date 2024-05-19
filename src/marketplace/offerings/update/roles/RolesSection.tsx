import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddRoleButton } from './AddRoleButton';
import { DeleteRoleButton } from './DeleteRoleButton';

export const RolesSection: FC<OfferingSectionProps> = (props) => (
  <Card>
    <Card.Header className="border-2 border-bottom">
      <Card.Title className="h5">
        <span className="me-2">{translate('Roles')}</span>
        <RefreshButton refetch={props.refetch} loading={props.loading} />
      </Card.Title>
      <div className="card-toolbar">
        <AddRoleButton {...props} />
      </div>
    </Card.Header>
    <Card.Body>
      {props.offering.roles.length === 0 ? (
        <div className="justify-content-center row">
          <div className="col-sm-4">
            <p className="text-center">
              {translate("Offering doesn't have roles.")}
            </p>
          </div>
        </div>
      ) : (
        <Table bordered={true} hover={true} responsive={true}>
          <tbody>
            {props.offering.roles.map((role) => (
              <tr key={role.uuid}>
                <td className="col-md-3">{role.name}</td>
                <td className="row-actions">
                  <div>
                    <DeleteRoleButton role={role} refetch={props.refetch} />
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
