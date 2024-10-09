import { AddressBook } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const CreditUsageButton = () => {
  return (
    <Dropdown.Item as="button">
      <span className="svg-icon svg-icon-2">
        <AddressBook weight="bold" />
      </span>
      {translate('Credit usage')}
    </Dropdown.Item>
  );
};
