import { useContext } from 'react';

import { TableContext, TableContextValue } from './TableContext';

/**
 * Hook to access the table context.
 * Must be used within a TableProvider.
 *
 * @internal This is for internal table component use only.
 */
export function useTableContext<TData = any>(): TableContextValue<TData> {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context as TableContextValue<TData>;
}
