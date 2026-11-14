import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Table from '@/table/Table';

import { ManagedProjectsList } from './ManagedProjectsList';

vi.mock('@/table/Table', () => ({ default: vi.fn(() => null) }));
vi.mock('@/table/useTable', () => ({ useTable: vi.fn(() => ({})) }));
vi.mock('@/table/useFilterValues', () => ({ useFilterValues: vi.fn() }));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

describe('ManagedProjectsList notes column', () => {
  it('is shown by default, as the way to read and add notes', () => {
    render(<ManagedProjectsList />);
    const { columns } = vi.mocked(Table).mock.calls.at(-1)[0] as any;
    const notes = columns.find((column) => column.id === 'notes');

    expect(notes).toBeDefined();
    expect(notes.optional).toBeFalsy();
  });
});
