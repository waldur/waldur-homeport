import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { typeAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { useSetProject } from '@/workspace/hooks';

import { ProjectField } from './ProjectField';

describe('ProjectField', () => {
  const user = userEvent.setup();
  const mockSetProject = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useSetProject).mockReturnValue(mockSetProject);
  });

  const renderComponent = (customer = null) => {
    return renderWithProviders(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ customer }}
        render={() => <ProjectField />}
      />,
    );
  };

  it('renders disabled state when no customer is selected', () => {
    renderComponent(null);
    const select = screen.getByLabelText(/Project/i);
    expect(select).toBeDisabled();
    expect(
      screen.getByText(/Please select organization first/i),
    ).toBeInTheDocument();
  });

  it('renders enabled state when customer is selected', () => {
    renderComponent({ uuid: 'customer-uuid' });
    const select = screen.getByLabelText(/Project/i);
    expect(select).not.toBeDisabled();
    expect(screen.getByText(/Select project.../i)).toBeInTheDocument();
  });

  it('calls setCurrentProject on change', async () => {
    renderComponent({ uuid: 'customer-uuid' });

    vi.mocked(projectsList).mockResolvedValue(
      mockListResponse([
        { uuid: 'project-uuid', name: 'Project A', url: 'project-url' },
      ]),
    );

    await typeAndSelectOption(user, 'Project', 'Project A', 'Project A');

    await waitFor(() => {
      expect(mockSetProject).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: 'project-uuid',
          name: 'Project A',
        }),
      );
    });
  });

  it('shows validation error if project is missing', async () => {
    renderComponent({ uuid: 'customer-uuid' });

    const select = screen.getByLabelText(/Project/i);
    await user.click(select);
    await user.tab(); // Blur to trigger validation

    await waitFor(() => {
      expect(screen.getByText(/This field is required./i)).toBeInTheDocument();
    });
  });
});
