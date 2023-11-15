import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DropdownLink } from './DropdownLink';

export const OpenPublicOffering = ({ row }) => (
  <Dropdown.Item
    as={DropdownLink}
    state="public.marketplace-public-offering"
    params={{
      uuid: row.uuid,
    }}
  >
    {translate('Open public page')}
  </Dropdown.Item>
);
