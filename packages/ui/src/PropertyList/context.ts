import { createContext, useContext } from 'react';

import type { PropertyListContextValue } from './types';

export const PropertyListContext = createContext<PropertyListContextValue>({
  insideList: false,
  variant: 'divided',
});

export const usePropertyListContext = () => useContext(PropertyListContext);
