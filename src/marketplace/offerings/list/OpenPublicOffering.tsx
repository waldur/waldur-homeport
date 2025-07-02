import { ShoppingCartIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({
  row,
}: {
  row: ProviderOfferingDetails;
}) => (
  <Dropdown.Item
    as={DropdownLink}
    state="public-offering.marketplace-public-offering"
    params={{
      uuid: row.uuid,
    }}
  >
    <span className="svg-icon svg-icon-2">
      <ShoppingCartIcon weight="bold" />
    </span>
    {translate('Open public page')}
  </Dropdown.Item>
);
