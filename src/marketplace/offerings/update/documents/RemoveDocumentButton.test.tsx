import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceOfferingFilesDestroy } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { RemoveDocumentAction } from './RemoveDocumentButton';

// Capture the config handed to useManagedMutation (the hook itself is covered by
// its own test) so we can assert how this action wires the delete request.
const { captured, mutate } = vi.hoisted(() => ({
  captured: { value: null as any },
  mutate: vi.fn(),
}));

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: (config: any) => {
    captured.value = config;
    return { isPending: false, mutate };
  },
}));

const row = { uuid: 'file-1', name: 'User Guide' };
const offering = { uuid: 'offering-uuid', name: 'Test offering' } as any;

const renderAction = () => {
  const refetch = vi.fn();
  const result = renderWithProviders(
    <RemoveDocumentAction row={row} offering={offering} refetch={refetch} />,
  );
  return { ...result, refetch };
};

describe('RemoveDocumentAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.value = null;
  });

  it('renders a Remove item that triggers the mutation', async () => {
    const user = userEvent.setup();
    renderAction();

    const remove = screen.getByText('Remove');
    await user.click(remove);
    expect(mutate).toHaveBeenCalled();
  });

  it('deletes the file by its uuid', () => {
    renderAction();
    captured.value.mutationFn();
    expect(marketplaceOfferingFilesDestroy).toHaveBeenCalledWith({
      path: { uuid: 'file-1' },
    });
  });

  it('confirms deletion referencing the document and offering names', () => {
    const { refetch } = renderAction();
    expect(captured.value.confirmation.body).toContain('User Guide');
    expect(captured.value.confirmation.body).toContain('Test offering');
    expect(captured.value.confirmation.options).toEqual({ forDeletion: true });
    expect(captured.value.refetch).toBe(refetch);
  });
});
