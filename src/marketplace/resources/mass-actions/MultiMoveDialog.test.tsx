import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesMoveResource,
  projectsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOptionInContainer } from '@/test/select';

import { MultiMoveDialog } from './MultiMoveDialog';

const renderComponent = (props) => {
  return renderWithProviders(<MultiMoveDialog {...props} />);
};

const mockRows = [
  { uuid: 'resource-1', name: 'Resource 1' },
  { uuid: 'resource-2', name: 'Resource 2' },
] as any;

describe('MultiMoveDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog correctly', () => {
    renderComponent({
      resolve: { rows: mockRows, refetch: vi.fn() },
    });

    expect(screen.getByText('Mass move resources')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls marketplaceResourcesMoveResource for each resource on submit', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceResourcesMoveResource).mockResolvedValue({
      data: {},
    } as any);
    vi.mocked(projectsList).mockResolvedValue({
      data: [
        { name: 'Project 1', url: 'project-url-1', customer_name: 'Org 1' },
      ],
      response: {
        headers: new Headers({ 'x-result-count': '1' }),
      },
    } as any);

    renderComponent({
      resolve: { rows: mockRows, refetch },
    });

    // Select project
    const container = screen
      .getByRole('combobox')
      .closest('.metronic-select-container');
    await openAndSelectOptionInContainer(user, container, 'Project 1');

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
    expect(marketplaceResourcesMoveResource).toHaveBeenCalledTimes(2);
    expect(marketplaceResourcesMoveResource).toHaveBeenCalledWith({
      path: { uuid: 'resource-1' },
      body: { project: { url: 'project-url-1' } },
    });
    expect(marketplaceResourcesMoveResource).toHaveBeenCalledWith({
      path: { uuid: 'resource-2' },
      body: { project: { url: 'project-url-1' } },
    });
  });
});
