import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { EditResourceEndDateDialog } from './EditResourceEndDateDialog';

describe('EditResourceEndDateDialog', () => {
  const resource = {
    uuid: 'res-uuid',
    name: 'Test Resource',
    end_date: '2026-10-01',
    project_end_date: '2026-12-01',
  };

  const resolve = {
    resource: resource as any,
    refetch: vi.fn(),
    updateEndDate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    renderWithProviders(<EditResourceEndDateDialog resolve={resolve} />);

  it('renders correctly with initial values', () => {
    renderComponent();
    expect(screen.getByLabelText('Termination date')).toHaveValue('2026-10-01');
  });

  it('handles date conflicts and resolution', async () => {
    renderComponent();

    const input = screen.getByLabelText('Termination date');

    // 1. Trigger conflict
    fireEvent.change(input, { target: { value: '2027-01-01' } });
    await waitFor(() => {
      expect(screen.getByText('Date conflict')).toBeInTheDocument();
    });

    // 2. Resolve conflict
    const useProjectDateBtn = screen.getByText('Use project date');
    fireEvent.click(useProjectDateBtn);
    await waitFor(() => {
      expect(input).toHaveValue('2026-12-01');
    });
    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    resolve.updateEndDate.mockResolvedValue({ data: {} });
    renderComponent();

    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(resolve.updateEndDate).toHaveBeenCalledWith(
        'res-uuid',
        '2026-10-01',
      );
    });

    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalled();
    });
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('handles clearing the date', async () => {
    renderComponent();
    const input = screen.getByLabelText('Termination date');

    fireEvent.change(input, { target: { value: '' } });

    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(resolve.updateEndDate).toHaveBeenCalledWith('res-uuid', null);
    });
  });

  it('does not show conflict warning if project has no end date', () => {
    const resourceNoProjectEnd = { ...resource, project_end_date: null };
    renderWithProviders(
      <EditResourceEndDateDialog
        resolve={{ ...resolve, resource: resourceNoProjectEnd as any }}
      />,
    );

    const input = screen.getByLabelText('Termination date');
    fireEvent.change(input, { target: { value: '2027-01-01' } });

    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('does not show conflict if termination date equals project end date', () => {
    renderComponent();
    const input = screen.getByLabelText('Termination date');

    fireEvent.change(input, { target: { value: '2026-12-01' } });

    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('handles API errors during submission', async () => {
    const error = new Error('API Error');
    resolve.updateEndDate.mockRejectedValue(error);
    renderComponent();

    const saveBtn = screen.getByText('Save');
    // We use fireEvent.click, which triggers onSubmit.
    // Since mutateAsync rejects, we might need to wait for the rejection to be handled.
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to edit resource.',
      );
    });
  });
});
