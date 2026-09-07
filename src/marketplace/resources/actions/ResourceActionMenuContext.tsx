import { createContext } from 'react';

export interface ResourceActionMenuContextModel {
  query: string;
  hideDisabled?: boolean;
  hideGroupName?: boolean;
  hideNonImportant?: boolean;
  /**
   * True when the action list is rendered somewhere with no real Radix
   * Menu/Popover ancestor at all (ModalActionsDialog's "show all actions"
   * search results, inside a plain react-bootstrap Modal). ActionItem
   * reads this to render rows as PlainActionItem instead of its usual
   * ActionsDropdownItem, which throws outside a Menu Root/Content.
   */
  notInMenu?: boolean;
}

export const ResourceActionMenuContext =
  createContext<ResourceActionMenuContextModel>({
    query: '',
    hideDisabled: false,
    hideGroupName: false,
    hideNonImportant: false,
  });
