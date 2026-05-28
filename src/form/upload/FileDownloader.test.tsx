import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockBlob } as any);

    render(<FileDownloader url={mockUrl} name={mockName} />);

    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  it('shows error notification when download fails', async () => {
    const error = new Error('Download failed');
    vi.spyOn(api, 'get').mockRejectedValue(error);

    render(<FileDownloader url={mockUrl} name={mockName} />);

    await userEvent.click(screen.getByRole('button'));

    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      'File download failed',
    );
  });
});
