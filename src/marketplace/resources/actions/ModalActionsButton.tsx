import { DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <DropdownButton title={translate('Actions')} variant="light">
    <ActionsPopover {...props} />
  </DropdownButton>
);
