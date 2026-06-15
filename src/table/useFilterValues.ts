import { useSelector } from 'react-redux';

import { selectFilterValues } from './selectors';

/**
 * Returns the current filter values for a table as a flat {name: value} map.
 * Drop-in replacement for `useFormState().values` in table filter consumers.
 */
export const useFilterValues = (table: string): Record<string, any> => {
  return useSelector(selectFilterValues(table));
};
