import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { AddRoleButton } from './AddRoleButton';
import { DeleteRoleButton } from './DeleteRoleButton';

export const RolesSection: FC<OfferingSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'OfferingRolesList',
    fetchData: () =>
      Promise.resolve({
        rows: props.offering.roles,
      }),
  });

  return (
    <Card className="card-bordered">
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          <span className="me-2">{translate('Roles')}</span>
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </Card.Title>
        <div className="card-toolbar">
          <AddRoleButton {...props} />
        </div>
      </Card.Header>
      <Table
        {...tableProps}
        cardBordered={false}
        columns={[
          {
            title: translate('Role'),
            render: ({ row }) => row.name,
          },
        ]}
        verboseName={translate('Roles')}
        placeholderComponent={
          <NoResult
            callback={props.refetch}
            title={translate('No roles found')}
            message={translate("Offering doesn't have roles.")}
            buttonTitle={translate('Search again')}
            className="mt-n5"
          />
        }
        hasActionBar={false}
        rowActions={({ row }) => (
          <DeleteRoleButton role={row} refetch={props.refetch} />
        )}
      />
    </Card>
  );
};
