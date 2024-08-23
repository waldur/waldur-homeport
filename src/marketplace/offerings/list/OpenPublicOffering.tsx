import { ShoppingCart } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({ row }) => (
  <Dropdown.Item
    as={DropdownLink}
    state="public-offering.marketplace-public-offering"
    params={{
      uuid: row.uuid,
    }}
  >
    <span className="svg-icon svg-icon-2">
      <ShoppingCart />
    </span>
    {translate('Open public page')}
  </Dropdown.Item>
);
