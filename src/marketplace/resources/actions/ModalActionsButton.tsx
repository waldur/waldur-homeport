import { ActionsDropdownComponent } from '@/table/ActionsDropdown';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <ActionsDropdownComponent
    labeled={props.labeled}
    drop={props.drop}
    disabled={props.disabled}
    size={props.size}
  >
    <ActionsPopover {...props} />
  </ActionsDropdownComponent>
);
