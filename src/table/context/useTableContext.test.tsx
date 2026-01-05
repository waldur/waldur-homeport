import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createMockTableContext, TableContext } from '../test-utils';

import { useTableContext } from './useTableContext';

describe('useTableContext', () => {
  it('throws error when used outside TableProvider', () => {
    expect(() => {
      renderHook(() => useTableContext());
    }).toThrow('useTableContext must be used within a TableProvider');
  });

  it('returns context value when used inside TableProvider', () => {
    const mockContextValue = createMockTableContext({
      rows: [{ id: 1, name: 'Test' }],
      hasRows: true,
      pagination: { resultCount: 1, currentPage: 1, pageSize: 10 },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TableContext.Provider value={mockContextValue}>
        {children}
      </TableContext.Provider>
    );

    const { result } = renderHook(() => useTableContext(), { wrapper });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.config.table).toBe('test-table');
  });

  it('preserves type information for generic data', () => {
    interface TestRow {
      id: number;
      name: string;
    }

    const mockContextValue = createMockTableContext({
      rows: [{ id: 1, name: 'Test' }] as TestRow[],
      hasRows: true,
      pagination: { resultCount: 1, currentPage: 1, pageSize: 10 },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <TableContext.Provider value={mockContextValue}>
        {children}
      </TableContext.Provider>
    );

    const { result } = renderHook(() => useTableContext<TestRow>(), {
      wrapper,
    });

    // TypeScript should know rows is TestRow[]
    expect(result.current.rows[0].name).toBe('Test');
  });
});
