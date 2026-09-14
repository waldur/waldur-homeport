import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RoleHygieneTable } from './RoleHygieneTable';

const resetPagination = vi.fn();

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ resetPagination }),
}));

vi.mock('@/table/Table', () => ({
  default: ({ tabs }) => (
    <>
      {tabs.map((tab) => (
        <button key={tab.key} type="button" onClick={tab.onSelect}>
          {tab.key}
        </button>
      ))}
    </>
  ),
}));

describe('RoleHygieneTable', () => {
  it('goes back to the first page when a severity tab is picked', async () => {
    const onSelectSeverity = vi.fn();
    renderWithProviders(
      <RoleHygieneTable findings={[]} onSelectSeverity={onSelectSeverity} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'error' }));

    expect(onSelectSeverity).toHaveBeenCalledWith('error');
    expect(resetPagination).toHaveBeenCalled();
  });
});
