import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

vi.mock('@/form/SelectField', () => ({
  SelectField: ({ input, options, placeholder }: any) => (
    <select
      data-testid="category-select"
      value={input.value ?? ''}
      onChange={(e) => input.onChange(e.target.value || null)}
    >
      <option value="">{placeholder}</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

const patchMessageByBackendUuid = vi.fn();
vi.mock('@/ai-assistant/logic/ThreadProvider', () => ({
  useThreadContext: () => ({ patchMessageByBackendUuid }),
}));

import { FeedbackDialog } from './FeedbackDialog';

vi.mock('waldur-js-client');

const renderDialog = (
  initial: { score?: boolean; [key: string]: any } = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const store = createStore(() => ({}), applyMiddleware(thunk));
  const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  return render(
    <FeedbackDialog
      resolve={{
        messageUuid: 'msg-1',
        score: false,
        currentComment: '',
        currentCategory: undefined,
        ...initial,
      }}
    />,
    { wrapper },
  );
};

describe('FeedbackDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sdk.chatMessagesFeedback).mockResolvedValue({
      data: { feedback_score: false },
      error: undefined,
    } as any);
  });

  it('renders all 5 category options and a comment field', () => {
    renderDialog();
    const select = screen.getByTestId('category-select');
    // 5 category options + 1 placeholder option
    expect(select.querySelectorAll('option[value]').length).toBe(6);
    expect(select.querySelectorAll('option:not([value=""])').length).toBe(5);
    expect(screen.getByPlaceholderText(/what was wrong/i)).toBeInTheDocument();
  });

  it('submits selected categories and comment to the API', async () => {
    renderDialog();
    await userEvent.selectOptions(
      screen.getByTestId('category-select'),
      'inaccurate',
    );
    await userEvent.type(
      screen.getByPlaceholderText(/what was wrong/i),
      'it said 5 but I have 3',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(sdk.chatMessagesFeedback).toHaveBeenCalledWith({
        path: { uuid: 'msg-1' },
        body: {
          score: false,
          comment: 'it said 5 but I have 3',
          category: 'inaccurate',
        },
      });
    });
  });

  it('pre-fills when resolve has existing values', () => {
    renderDialog({
      currentComment: 'previous comment',
      currentCategory: 'other',
    });
    expect(screen.getByDisplayValue('previous comment')).toBeInTheDocument();
    expect(
      (screen.getByTestId('category-select') as HTMLSelectElement).value,
    ).toBe('other');
  });

  it('hides the categories section when score is true', () => {
    renderDialog({ score: true });
    expect(screen.queryByTestId('category-select')).toBeNull();
  });

  it('submits score=true with just a comment when thumbs-up dialog is used', async () => {
    renderDialog({ score: true });
    await userEvent.type(
      screen.getByPlaceholderText(/what was helpful/i),
      'nice answer',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(sdk.chatMessagesFeedback).toHaveBeenCalledWith({
        path: { uuid: 'msg-1' },
        body: {
          score: true,
          comment: 'nice answer',
        },
      });
    });
  });

  it('patches thread state with the server response after a successful submit', async () => {
    vi.mocked(sdk.chatMessagesFeedback).mockResolvedValue({
      data: {
        feedback_score: false,
        feedback_comment: 'wrong info',
        feedback_category: 'inaccurate',
        feedback_submitted_at: '2026-04-19T10:00:00Z',
      },
      error: undefined,
    } as any);

    renderDialog();
    await userEvent.selectOptions(
      screen.getByTestId('category-select'),
      'inaccurate',
    );
    await userEvent.type(
      screen.getByPlaceholderText(/what was wrong/i),
      'wrong info',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(patchMessageByBackendUuid).toHaveBeenCalledWith('msg-1', {
        feedback_score: false,
        feedback_comment: 'wrong info',
        feedback_category: 'inaccurate',
        feedback_submitted_at: '2026-04-19T10:00:00Z',
      });
    });
  });
});
