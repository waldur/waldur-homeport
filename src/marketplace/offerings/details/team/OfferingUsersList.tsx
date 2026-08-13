import { FC, useMemo } from 'react';
import {
  marketplaceProviderOfferingsListUsersList,
  MarketplaceProviderOfferingsListUsersListData,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { TeamTableComponent } from '@/customer/team/TeamTableComponent';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { OfferingPermissionLogButton } from './OfferingPermissionLogButton';
import { OfferingTeamAddDropdown } from './OfferingTeamAddDropdown';
import { OfferingUserRowActions } from './OfferingUserRowActions';

interface OfferingUsersListProps {
  offering: Offering;
  tableTabs?: any[];
  title?: string;
}

/**
 * Active members of an offering, from the generic role endpoint
 * (`/marketplace-provider-offerings/{uuid}/list_users/`), which returns every
 * grant on the scope — including custom offering-scoped roles, not just
 * `OFFERING.MANAGER`.
 */
export const OfferingUsersList: FC<OfferingUsersListProps> = ({
  offering,
  tableTabs,
  title,
}) => {
  const tableProps = useTable({
    table: `OfferingUsersList-${offering.uuid}`,
    fetchData: createFetcher(marketplaceProviderOfferingsListUsersList, {
      path: {
        uuid: offering.uuid,
      } satisfies MarketplaceProviderOfferingsListUsersListData['path'],
    }),
    queryField: 'search_string',
    // The row actions need the user and role identifiers, which no visible
    // column declares via `keys`; without them the fetcher would omit the
    // fields and revoke/update would post undefined.
    mandatoryFields: [
      'uuid',
      'user_uuid',
      'user_username',
      'user_full_name',
      'user_email',
      'user_image',
      'role_name',
      'role_uuid',
      'expiration_time',
    ],
  });

  const rowActions = useMemo(
    () =>
      ({ row }) => (
        <OfferingUserRowActions
          row={row}
          offering={offering}
          refetch={tableProps.fetch}
        />
      ),
    [offering, tableProps.fetch],
  );

  return (
    <TeamTableComponent
      {...tableProps}
      userFieldPrefix="user_"
      title={title ?? translate('Team')}
      tabs={tableTabs}
      tableActions={
        <OfferingTeamAddDropdown
          offering={offering}
          refetch={tableProps.fetch}
        />
      }
      dropdownActions={<OfferingPermissionLogButton offering={offering} />}
      rowActions={rowActions}
      enableExport
      showExportInDropdown
    />
  );
};
