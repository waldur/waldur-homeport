import { useRouter } from '@uirouter/react';
import { Offering } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { canViewOfferingPages } from '@/marketplace/canUseMarketplaceShopUi';
import { useUser } from '@/workspace/hooks';

export const ViewOfferingButton = ({
  offering,
  disabled,
  disabledReason,
}: {
  offering: Offering;
  disabled?: boolean;
  disabledReason?: string;
}) => {
  const router = useRouter();
  const user = useUser();
  if (!canViewOfferingPages(user)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    router.stateService.go('public-offering.marketplace-public-offering', {
      uuid: offering.uuid,
    });
  };

  return (
    <BaseButton
      size="sm"
      variant="text-primary"
      disabled={disabled}
      onClick={handleClick}
      label={translate('View offering')}
      disabledReason={disabledReason}
    />
  );
};
