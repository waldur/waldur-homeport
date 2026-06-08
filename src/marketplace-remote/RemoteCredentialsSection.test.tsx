import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { RemoteCredentialsSection } from './RemoteCredentialsSection';

describe('RemoteCredentialsSection', () => {
  it('renders BaseCredentialsSection and explicitly includes the backend_id field', () => {
    const offering = {
      backend_id: 'test-backend-id',
    } as any;

    renderWithProviders(
      <RemoteCredentialsSection offering={offering} refetch={vi.fn()} />,
    );

    // Renders the label for the backend_id field
    expect(screen.getByText('Backend ID')).toBeInTheDocument();
    // Verify the value renders in the display
    expect(screen.getByText('test-backend-id')).toBeInTheDocument();
  });
});
