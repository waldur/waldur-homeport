import { useRouter } from '@uirouter/react';
import { FC, MouseEvent, useCallback } from 'react';

import { Link } from '@/core/Link';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';
import { canViewOfferingPages } from '@/marketplace/canUseMarketplaceShopUi';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { useUser } from '@/workspace/hooks';

const stopPropagation = (e: MouseEvent) => e.stopPropagation();

export const AvailableOfferingCard: FC<{ availableOffering }> = ({
  availableOffering,
}) => {
  const router = useRouter();
  // Linked only where the offering's page would open for the user.
  const linkOffering = canViewOfferingPages(useUser());
  // The card navigates via onClick instead of wrapping everything in an
  // anchor: the footer holds its own links, and nesting <a> inside <a> is
  // invalid DOM (same pattern as ProjectCard).
  const openOffering = useCallback(
    () =>
      router.stateService.go('public-offering.marketplace-public-offering', {
        uuid: availableOffering.uuid,
      }),
    [router, availableOffering.uuid],
  );

  return (
    <ModelCard1
      title={availableOffering.name}
      subtitle={availableOffering.customer_name}
      body={availableOffering.description}
      clickable={linkOffering}
      onClick={linkOffering ? openOffering : undefined}
      footer={
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="flex justify-end gap-1.5" onClick={stopPropagation}>
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
};
