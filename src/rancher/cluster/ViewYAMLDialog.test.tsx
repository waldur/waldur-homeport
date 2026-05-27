import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { translate } from '@/i18n';

import { ViewYAMLDialog } from './ViewYAMLDialog';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Mock heavy/external dependencies

vi.mock('@/form/MonacoField', () => ({
  MonacoField: ({ input, language }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={input.value}
      onChange={(e) => input.onChange(e.target.value)}
      data-language={language}
    />
  ),
}));

// Mock hooks that interact with Redux modal/notification state

vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

const mockMutateAsync = vi.fn();
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({
    mutateAsync: mockMutateAsync,
  }),
}));

const mockYamlRetrieve = vi.fn();
const mockYamlUpdate = vi.fn();
const resource = { uuid: 'resource-uuid' };

describe('ViewYAMLDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    mockYamlRetrieve.mockReturnValue(new Promise(() => {})); // Never resolves
    render(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
      { wrapper: TestWrapper },
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders YAML content after successful fetch', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    render(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
      { wrapper: TestWrapper },
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('monaco-editor')).toHaveValue('key: value');
    expect(
      screen.getByText(translate('Copy to clipboard')),
    ).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockYamlRetrieve.mockRejectedValue(new Error('Fetch failed'));
    render(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
      { wrapper: TestWrapper },
    );

    await waitFor(() => {
      expect(
        screen.getByText(translate('Unable to load data.')),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(translate('Reload'))).toBeInTheDocument();
  });

  it('submits updated YAML', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    render(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
      { wrapper: TestWrapper },
    );

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.change(editor, { target: { value: 'key: updated' } });

    const submitButton = screen.getByText(translate('Submit'));
    fireEvent.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({ yaml: 'key: updated' });
  });

  it('toggles diff view', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    render(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
      { wrapper: TestWrapper },
    );

    await waitFor(() => {
      expect(screen.getByText(translate('Show diff'))).toBeInTheDocument();
    });

    const toggleButton = screen.getByText(translate('Show diff'));
    fireEvent.click(toggleButton);

    expect(screen.getByText(translate('Hide diff'))).toBeInTheDocument();
  });
});
