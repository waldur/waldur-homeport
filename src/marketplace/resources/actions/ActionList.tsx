import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { MenuLookProvider } from 'waldur-ui';

import { ResourceAction } from './constants';

/** Which actions a list shows. */
export interface ActionListFilter {
  /** Only actions whose label contains it (case-insensitive). */
  query?: string;
  hideDisabled?: boolean;
  hideNonImportant?: boolean;
  /** Leave out the ActionGroup captions. */
  hideGroupName?: boolean;
}

/** What an action row tells the filter about itself. */
export interface ActionVisibilityProps {
  label: string;
  disabled?: boolean;
  important?: boolean;
  actionId?: ResourceAction;
  resource?: any;
}

/**
 * Whether an action belongs in a list: not switched off for the resource's
 * offering (`disabled_resource_actions`), and passing the list's filter.
 */
export const isActionVisible = (
  filter: ActionListFilter,
  { label, disabled, important, actionId, resource }: ActionVisibilityProps,
) => {
  if (
    actionId &&
    resource?.offering_plugin_options?.disabled_resource_actions?.includes(
      actionId,
    )
  ) {
    return false;
  }
  if (
    filter.query &&
    !label.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase())
  ) {
    return false;
  }
  if (filter.hideDisabled && disabled) {
    return false;
  }
  if (filter.hideNonImportant && !important) {
    return false;
  }
  return true;
};

const ActionListContext = createContext<ActionListFilter>({});

/**
 * A list of resource actions with a filter: the resource's quick actions
 * (ActionsPopover.tsx, important ones only) and the "show all actions"
 * dialog (ActionDialogBody.tsx, searchable). The actions are components
 * that know their own label and state, so each ActionItem inside checks
 * itself against the filter with isActionVisible.
 */
export const ActionList: FC<PropsWithChildren<ActionListFilter>> = ({
  query,
  hideDisabled,
  hideNonImportant,
  hideGroupName,
  children,
}) => {
  const filter = useMemo(
    () => ({ query, hideDisabled, hideNonImportant, hideGroupName }),
    [query, hideDisabled, hideNonImportant, hideGroupName],
  );
  return (
    <ActionListContext.Provider value={filter}>
      <MenuLookProvider look="actions">{children}</MenuLookProvider>
    </ActionListContext.Provider>
  );
};

export const useActionListFilter = () => useContext(ActionListContext);
