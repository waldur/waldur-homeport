import { ShoppingCartIcon } from '@phosphor-icons/react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import { useUser } from '@/workspace/hooks';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => {
  const user = useUser();
  if (!canUseMarketplaceShopUi(user)) {
    return null;
  }
  return (
    <Menu.Item asChild>
      <DropdownLink
        state="public-offering.marketplace-public-offering"
        params={{
          uuid: row.uuid,
        }}
        icon={<ShoppingCartIcon weight="bold" />}
      >
        {translate('Open public page')}
      </DropdownLink>
    </Menu.Item>
  );
};
