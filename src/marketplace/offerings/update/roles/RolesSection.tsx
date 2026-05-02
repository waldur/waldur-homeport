import { FC, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import { marketplaceOfferingRolesList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { AddRoleButton } from './AddRoleButton';
import { DeleteRoleAction } from './DeleteRoleButton';
import { EditRoleAction } from './EditRoleButton';

const formatContentType = (value?: string | null) => {
  if (!value) return null;
  if (value === 'resource_project') {
    return translate('Resource project');
  }
  if (value === 'resource') {
    return translate('Resource');
  }
  return value;
};

export const RolesSection: FC<OfferingSectionProps> = (props) => {
  const filter = useMemo(
    () => ({ offering_uuid: [props.offering.uuid] }),
    [props.offering.uuid],
  );
  const tableProps = useTable({
    table: 'OfferingRolesList',
    fetchData: createFetcher(marketplaceOfferingRolesList),
    filter,
  });

  const profileName = (props.offering as any).profile_name;
  const lockedByProfile = !!profileName;

  return (
    <>
      {lockedByProfile && (
        <Alert variant="info" className="mb-3">
          {translate(
            'Roles for this offering are managed centrally by the service profile "{profile}". To edit, manage the profile from the administration panel.',
            { profile: profileName },
          )}
        </Alert>
      )}
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
            title: translate('Scope'),
            render: ({ row }) =>
              renderFieldOrDash(formatContentType((row as any).content_type)),
          },
          {
            title: translate('Applies to'),
            render: ({ row }) => {
              const ot = (row as any).offering_type;
              if (ot) {
                return translate('All offerings of type "{type}"', {
                  type: ot,
                });
              }
              if (lockedByProfile) {
                return translate('Profile "{profile}"', {
                  profile: profileName,
                });
              }
              return translate('This offering');
            },
          },
          {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.description),
          },
          {
            title: translate('Permissions'),
            render: ({ row }) =>
              renderFieldOrDash(((row as any).permissions || []).join(', ')),
          },
        ]}
        verboseName={translate('Roles')}
        placeholderComponent={
          <NoResult
            callback={props.refetch}
            title={translate('No roles found')}
            message={
              lockedByProfile
                ? translate(
                    'No roles in the "{profile}" profile yet. Add some via the administration panel.',
                    { profile: profileName },
                  )
                : translate("Offering doesn't have roles.")
            }
            buttonTitle={translate('Search again')}
            className="mt-n5"
          />
        }
        hasQuery={false}
        rowActions={
          lockedByProfile
            ? undefined
            : ({ row }) => (
                <ActionsDropdown row={row} refetch={tableProps.fetch}>
                  <EditRoleAction row={row} refetch={tableProps.fetch} />
                  <DeleteRoleAction row={row} refetch={tableProps.fetch} />
                </ActionsDropdown>
              )
        }
        tableActions={
          lockedByProfile ? null : (
            <AddRoleButton {...props} refetch={tableProps.fetch} />
          )
        }
      />
    </>
  );
};
