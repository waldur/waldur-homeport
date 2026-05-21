import { FunctionComponent, useMemo } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { CreateOfferingUserButton } from '@/marketplace/offerings/details/CreateOfferingUserButton';
import { TosReportingButton } from '@/marketplace/offerings/update/tos/TosReportingButton';
import { ProviderOfferingUsersList } from '@/marketplace/service-providers/offering-users/ProviderOfferingUsersList';
import { TableExportButton } from '@/table/TableExportButton';

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
    <ProviderOfferingUsersList
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
