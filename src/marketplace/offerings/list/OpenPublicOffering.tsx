import { ShoppingCartIcon } from '@phosphor-icons/react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => (
  <ActionsDropdownItem asChild>
    <DropdownLink
      state="public-offering.marketplace-public-offering"
      params={{
        uuid: row.uuid,
      }}
    >
      <span className="svg-icon svg-icon-2">
        <ShoppingCartIcon weight="bold" />
      </span>
      {translate('Open public page')}
    </DropdownLink>
  </ActionsDropdownItem>
);
