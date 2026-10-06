import { ShoppingCartIcon } from '@phosphor-icons/react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => (
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
