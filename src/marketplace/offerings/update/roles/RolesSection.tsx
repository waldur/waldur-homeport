import { FC, useMemo } from 'react';
import { marketplaceOfferingUserRolesList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { OfferingSectionProps } from '../types';

import { AddRoleButton } from './AddRoleButton';
import { DeleteRoleAction } from './DeleteRoleButton';

export const RolesSection: FC<OfferingSectionProps> = (props) => {
  const filter = useMemo(
    () => ({ offering_uuid: [props.offering.uuid] }),
    [props.offering.uuid],
  );
  const tableProps = useTable({
    table: 'OfferingRolesList',
    fetchData: createFetcher(marketplaceOfferingUserRolesList),
    filter,
  });

  return (
    <Table
      {...tableProps}
      cardBordered={false}
      title={translate('Roles')}
      columns={[
        {
          title: translate('Role'),
          render: ({ row }) => row.name,
        },
        {
          title: translate('Scope type'),
          render: ({ row }) => renderFieldOrDash(row.scope_type),
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
      hasQuery={false}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <DeleteRoleAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={<AddRoleButton {...props} refetch={tableProps.fetch} />}
    />
  );
};
