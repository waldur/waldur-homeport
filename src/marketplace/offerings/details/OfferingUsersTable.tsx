import { FunctionComponent, useMemo } from 'react';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { CreateOfferingUserButton } from '@waldur/marketplace/offerings/details/CreateOfferingUserButton';
import { TosReportingButton } from '@waldur/marketplace/offerings/update/tos/TosReportingButton';
import { ProviderOfferingUsersListComponent } from '@waldur/marketplace/service-providers/offering-users/ProviderOfferingUsersList';
import { TableExportButton } from '@waldur/table/TableExportButton';

export const OfferingUsersTable: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const provider = useMemo(
    () => ({
      customer_uuid: offering.customer_uuid,
    }),
    [offering.customer_uuid],
  );

  return (
    <ProviderOfferingUsersListComponent
      provider={provider}
      offering={offering}
      tableActions={(tableProps) => (
        <>
          {isFeatureVisible(MarketplaceFeatures.display_user_tos) && (
            <TosReportingButton offeringUuid={offering.uuid} />
          )}
          <TableExportButton {...tableProps} />
          <CreateOfferingUserButton
            offering={offering}
            onSuccess={tableProps.fetch}
          />
        </>
      )}
    />
  );
};
