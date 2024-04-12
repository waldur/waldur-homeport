import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <OverlayTrigger
    trigger="click"
    placement="bottom"
    rootClose
    overlay={
      <Popover id="popover-modal-action">
        <ActionsPopover {...props} />
      </Popover>
    }
  >
    <Button variant="bg-light" className="dropdown-toggle">
      {translate('Actions')}
    </Button>
  </OverlayTrigger>
);
