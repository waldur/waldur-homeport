import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BulkUpload } from './BulkUpload';

const csvFile = () =>
  new File(['email,role\ncsv1@example.com,Project member\n'], 'invite.csv', {
    type: 'text/csv',
  });

describe('BulkUpload', () => {
  it('hands the parsed rows to the onImport of the latest render', async () => {
    const user = userEvent.setup();
    // The dialog's onImport closes over roles that load after it opens, so
    // the first-render handler would resolve every role against an empty list.
    const firstOnImport = vi.fn();
    const latestOnImport = vi.fn();
    const { rerender } = renderWithProviders(
      <BulkUpload onImport={firstOnImport} />,
    );
    rerender(<BulkUpload onImport={latestOnImport} />);

    await user.upload(screen.getByTestId('upload'), csvFile());

    await waitFor(() =>
      expect(latestOnImport).toHaveBeenCalledWith([
        {
          email: 'csv1@example.com',
          role: 'Project member',
          project: undefined,
        },
      ]),
    );
    expect(firstOnImport).not.toHaveBeenCalled();
  });
});
