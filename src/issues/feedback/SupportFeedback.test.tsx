import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportFeedbacksCreate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';

import { SupportFeedback } from './SupportFeedback';

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    supportFeedbacksCreate: vi.fn(),
  };
});

vi.mock('@uirouter/react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useRouter: vi.fn(),
  };
});

vi.mock('@/store/notify', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useNotify: vi.fn(),
  };
});

vi.mock('@/navigation/title', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useTitle: vi.fn(),
  };
});

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

describe('SupportFeedback', () => {
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

  const mockNotify = {
    showErrorResponse: vi.fn(),
    showSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
    vi.mocked(useNotify).mockReturnValue(mockNotify as any);
  });

  it('renders with initial values from router', () => {
    render(<SupportFeedback />);

    expect(screen.getByText('Evaluation')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('submits correctly', async () => {
    vi.mocked(supportFeedbacksCreate).mockResolvedValue({ data: {} } as any);
    render(<SupportFeedback />);

    const commentInput = screen.getByLabelText('Comment');
    fireEvent.change(commentInput, { target: { value: 'Great service' } });

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supportFeedbacksCreate).toHaveBeenCalledWith({
        body: {
          evaluation: 8,
          comment: 'Great service',
          token: 'test-token',
        },
      });
      expect(mockNotify.showSuccess).toHaveBeenCalledWith(
        'Thank you for your response!',
      );
      expect(mockRouter.stateService.go).toHaveBeenCalledWith('login');
    });
  });

  it('handles submission error', async () => {
    const error = new Error('API Error');
    vi.mocked(supportFeedbacksCreate).mockRejectedValue(error);
    render(<SupportFeedback />);

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockNotify.showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to send feedback.',
      );
    });
  });
});
