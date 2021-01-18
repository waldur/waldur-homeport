import { FC } from 'react';
import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const ActionMenuButton: FC<{}> = (props) => {
  return (
    <DropdownButton
      title={translate('Actions')}
      id="actions-dropdown-btn"
      className="dropdown-btn"
    >
      {props.children}
    </DropdownButton>
  );
};
