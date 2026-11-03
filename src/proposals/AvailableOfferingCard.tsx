import { FC } from 'react';

import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { useUser } from '@/workspace/hooks';

export const AvailableOfferingCard: FC<{ availableOffering }> = ({
  availableOffering,
}) => {
  const linkOffering = canUseMarketplaceShopUi(useUser());
  const card = (
    <ModelCard1
      title={availableOffering.name}
      subtitle={availableOffering.customer_name}
      body={availableOffering.description}
      clickable={linkOffering}
      footer={
        <div className="flex justify-end gap-1.5">
          <Link
            state="calls-for-proposals-all-calls"
            params={{ offering_uuid: availableOffering.uuid }}
            buttonVariant="text-primary"
            buttonSize="sm"
            label={translate('Apply to call')}
          />
          {linkOffering && (
            <OfferingDetailsLink
              offering_uuid={availableOffering.uuid}
              buttonVariant="text-primary"
              buttonSize="sm"
            >
              {translate('View offering')}
            </OfferingDetailsLink>
          )}
        </div>
      }
    />
  );

  if (!linkOffering) {
    return card;
  }

  return (
    <OfferingDetailsLink offering_uuid={availableOffering.uuid}>
      {card}
    </OfferingDetailsLink>
  );
};
