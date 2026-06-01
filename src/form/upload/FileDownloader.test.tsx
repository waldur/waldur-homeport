import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '@/core/api';
import { useNotify } from '@/store/notify';

import { FileDownloader } from './FileDownloader';

vi.mock('@/core/api');

describe('FileDownloader', () => {
  const mockUrl = 'http://example.com/file';
  const mockName = 'test.pdf';
  const mockBlob = new Blob(['test content'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders download button with icon', () => {
    render(<FileDownloader url={mockUrl} name={mockName} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows loading spinner while downloading', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockBlob } as any), 100),
        ),
    );

    render(<FileDownloader url={mockUrl} name={mockName} />);

    await user.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('shows error notification when download fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Download failed');
    vi.spyOn(api, 'get').mockRejectedValue(error);

    render(<FileDownloader url={mockUrl} name={mockName} />);

    await user.click(screen.getByRole('button'));

    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      'File download failed',
    );
  });
});
