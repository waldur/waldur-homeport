import { ActionsMenu } from '@/table/ActionsDropdown';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <ActionsMenu
    toggle={props.labeled ? 'labeled' : 'kebab'}
    side={props.side}
    disabled={props.disabled}
    size={props.size}
  >
    <ActionsPopover {...props} />
  </ActionsMenu>
);
