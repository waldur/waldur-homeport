import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { ViewYAMLDialog } from './ViewYAMLDialog';

const mockYamlRetrieve = vi.fn();
const mockYamlUpdate = vi.fn();
const resource = { uuid: 'resource-uuid' };

const renderDialog = () =>
  renderWithProviders(
    <ViewYAMLDialog
      resolve={{
        resource,
        yamlRetrieve: mockYamlRetrieve,
        yamlUpdate: mockYamlUpdate,
      }}
    />,
  );

describe('ViewYAMLDialog', () => {
  const user = userEvent.setup();

  it('renders loading state initially', () => {
    mockYamlRetrieve.mockReturnValue(new Promise(() => {})); // Never resolves
    renderDialog();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders YAML content after successful fetch', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    renderWithProviders(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toHaveValue('key: value');
    });
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockYamlRetrieve.mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load data.')).toBeInTheDocument();
    });
    expect(screen.getByText('Reload')).toBeInTheDocument();
  });

  it('submits updated YAML', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    renderWithProviders(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    const editor = screen.getByTestId('monaco-editor');
    await user.clear(editor);
    await user.type(editor, 'key: updated');

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockYamlUpdate).toHaveBeenCalledWith({
        uuid: 'resource-uuid',
        body: { yaml: 'key: updated' },
      });
    });
  });

  it('toggles diff view', async () => {
    mockYamlRetrieve.mockResolvedValue({ data: { yaml: 'key: value' } });
    renderWithProviders(
      <ViewYAMLDialog
        resolve={{
          resource,
          yamlRetrieve: mockYamlRetrieve,
          yamlUpdate: mockYamlUpdate,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Show diff')).toBeInTheDocument();
    });

    const toggleButton = screen.getByText('Show diff');
    await user.click(toggleButton);

    expect(screen.getByText('Hide diff')).toBeInTheDocument();
  });
});
