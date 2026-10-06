import { createContext, Ref, useContext } from 'react';

export interface ComboboxActionItem {
  id: string;
  label: string;
  disabled?: boolean;
  action: () => void;
  element: HTMLElement | null;
}

export interface ActionComboboxContextValue {
  registerItem: (item: ComboboxActionItem) => () => void;
  highlightedIndex: number;
  items: ComboboxActionItem[];
  getItemProps: (options: {
    item: ComboboxActionItem;
    index: number;
    ref?: Ref<any>;
  }) => Record<string, any>;
}

export const ActionComboboxContext =
  createContext<ActionComboboxContextValue | null>(null);

export const useActionCombobox = () => useContext(ActionComboboxContext);
