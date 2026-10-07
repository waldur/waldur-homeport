import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { VersionDiffViewer } from './VersionDiffViewer';

const mockCurrentVersion = {
  uuid: 'v2',
  version: 2,
  serialized_data: JSON.stringify({ name: 'New Name' }),
} as any;

const mockPreviousVersion = {
  uuid: 'v1',
  version: 1,
  serialized_data: JSON.stringify({ name: 'Old Name' }),
} as any;

describe('VersionDiffViewer', () => {
  it('renders SegmentedControl with Table and JSON view options', async () => {
    render(
      <VersionDiffViewer
        entityType="resource"
        currentVersion={mockCurrentVersion}
        previousVersion={mockPreviousVersion}
      />,
    );

    const radiogroup = screen.getByRole('radiogroup', { name: 'Diff view' });
    expect(radiogroup).toBeInTheDocument();

    const tableOption = screen.getByRole('radio', { name: 'Table' });
    const jsonOption = screen.getByRole('radio', { name: 'JSON' });

    expect(tableOption).toBeInTheDocument();
    expect(jsonOption).toBeInTheDocument();
    expect(tableOption).toHaveAttribute('data-state', 'checked');

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
  });

  it('switches between Table and JSON view modes when selected', async () => {
    const user = userEvent.setup();
    render(
      <VersionDiffViewer
        entityType="resource"
        currentVersion={mockCurrentVersion}
        previousVersion={mockPreviousVersion}
      />,
    );

    const jsonOption = screen.getByRole('radio', { name: 'JSON' });
    await user.click(jsonOption);

    expect(jsonOption).toHaveAttribute('data-state', 'checked');
    expect(screen.getByRole('radio', { name: 'Table' })).toHaveAttribute(
      'data-state',
      'unchecked',
    );

    await waitFor(() =>
      expect(screen.getByTestId('monaco-diff-editor')).toBeInTheDocument(),
    );
  });
});
