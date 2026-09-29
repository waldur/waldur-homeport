import { FC } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceOfferingProfilesList } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { tabTableProps } from '@/administration/tabTableProps';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { isStaff as isStaffSelector } from '@/workspace/selectors';

import { CreateProfileAction } from './CreateProfileAction';
import { OfferingProfilesRowActions } from './OfferingProfilesRowActions';

export const OfferingProfilesList: FC<Partial<TableWithPortal>> = ({
  portal,
}) => {
  // Profiles are read-open, but only staff may create, edit or delete them.
  const isStaff = useSelector(isStaffSelector);
  const tableProps = useTable({
    table: 'OfferingProfilesList',
    fetchData: createFetcher(marketplaceOfferingProfilesList),
  });

  return (
    // `pt-5`: the spacing contract for a TableWithTabs pane, as in
    // RoleHygienePage; without it the notice butts up against the tab strip.
    <div className="pt-5">
      <AlertItem
        variant="info"
        title={translate('What is a service profile?')}
        body={translate(
          "A service profile is a named set of roles shared by several offerings. Binding an offering to a profile makes the profile's roles assignable on that offering, which shows up on the Availability tab. Adding or removing a role here updates every bound offering in the background. Offerings are bound to a profile from their own settings, and offerings of different types can share one profile.",
        )}
      />
      <Table
        {...tableProps}
        {...tabTableProps(portal)}
        title={translate('Service profiles')}
        verboseName={translate('service profiles')}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => (
              <Link
                state="admin-marketplace-offering-profile-detail"
                params={{ uuid: row.uuid }}
              >
                {row.name}
              </Link>
            ),
            keys: ['name'],
          },
          {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.description),
            keys: ['description'],
          },
          {
            title: translate('Roles'),
            render: ({ row }) => (row.roles || []).length,
          },
          {
            title: translate('Offerings'),
            render: ({ row }) => row.offerings_count ?? 0,
          },
        ]}
        rowActions={
          isStaff
            ? ({ row }) => (
                <OfferingProfilesRowActions
                  row={row}
                  refetch={tableProps.fetch}
                />
              )
            : undefined
        }
        tableActions={
          isStaff ? (
            <CreateProfileAction refetch={tableProps.fetch} />
          ) : undefined
        }
      />
    </div>
  );
};
