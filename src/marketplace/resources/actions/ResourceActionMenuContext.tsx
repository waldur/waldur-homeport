import { createContext } from 'react';

export interface ResourceActionMenuContextModel {
  query: string;
  hideDisabled?: boolean;
  hideGroupName?: boolean;
  hideNonImportant?: boolean;
}

export const ResourceActionMenuContext =
  createContext<ResourceActionMenuContextModel>({
    query: '',
    hideDisabled: false,
    hideGroupName: false,
    hideNonImportant: false,
  });
