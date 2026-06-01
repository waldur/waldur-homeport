import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportFeedbacksCreate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { SupportFeedback } from './SupportFeedback';

describe('SupportFeedback', () => {
  const user = userEvent.setup();
  const mockRouter = {
    globals: {
      params: {
        token: 'test-token',
        evaluation: '8',
      },
    },
    stateService: {
      go: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  it('renders with initial values from router', () => {
    renderWithProviders(<SupportFeedback />);

    expect(screen.getByText('Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits correctly', async () => {
    vi.mocked(supportFeedbacksCreate).mockResolvedValue({ data: {} } as any);
    renderWithProviders(<SupportFeedback />);

    const commentInput = screen.getByLabelText('Comment');
    await user.type(commentInput, 'Great service');

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(supportFeedbacksCreate).toHaveBeenCalledWith({
        body: {
          evaluation: 8,
          comment: 'Great service',
          token: 'test-token',
        },
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Thank you for your response!',
      );
      expect(mockRouter.stateService.go).toHaveBeenCalledWith('login');
    });
  });

  it('handles submission error', async () => {
    const error = new Error('API Error');
    vi.mocked(supportFeedbacksCreate).mockRejectedValue(error);
    renderWithProviders(<SupportFeedback />);

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to send feedback.',
      );
    });
  });
});
