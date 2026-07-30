import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ResourceApiKeysTab } from './ResourceApiKeysTab';
import { useResourceApiKeysTable } from './useResourceApiKeys';

vi.mock('./useResourceApiKeys', () => ({
  useResourceApiKeysTable: vi.fn(() => ({ rows: [], fetch: vi.fn() })),
}));
vi.mock('./ResourceApiKeysCard', () => ({
  ResourceApiKeysCard: ({ resource, rows }: any) => (
    <div data-testid="keys-card" data-resource={resource.uuid}>
      {rows.length}
    </div>
  ),
}));

const RESOURCE = { uuid: 'res-1' } as any;

describe('ResourceApiKeysTab', () => {
  it('feeds the card the resource and its keys', () => {
    vi.mocked(useResourceApiKeysTable).mockReturnValue({
      rows: [{ uuid: 'k1', state: 'OK' }],
      fetch: vi.fn(),
    } as any);

    renderWithProviders(<ResourceApiKeysTab resource={RESOURCE} />);

    const card = screen.getByTestId('keys-card');
    expect(card).toHaveAttribute('data-resource', 'res-1');
    expect(card).toHaveTextContent('1');
    expect(useResourceApiKeysTable).toHaveBeenCalledWith(RESOURCE);
  });
});
