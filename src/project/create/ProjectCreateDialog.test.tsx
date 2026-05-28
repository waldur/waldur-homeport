import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIRouter } from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  projectsCreate,
  projectsList,
  projectTypesList,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { ENV } from '@/core/config';
import { createTestQueryClient, renderWithProviders } from '@/test/harness';
import { createTestRouter } from '@/test/router';
import * as workspaceHooks from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { ProjectCreateDialog } from './ProjectCreateDialog';

ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY = false;
ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE = false;
ENV.FEATURES.project = {
  show_description_in_create_dialog: true,
  show_type_in_create_dialog: true,
};

describe('ProjectCreateDialog', () => {
  const mockedRefetch = vi.fn();

  const renderComponent = async () => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(projectsCreate).mockResolvedValue({
      data: { uuid: 'mock-project-uuid' },
    } as any);

    const router = createTestRouter();

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(['CustomerProjects', 'mock-customer-uuid'], []);

    await renderWithProviders(
      <UIRouter router={router}>
        <ProjectCreateDialog
          customer={
            {
              uuid: 'mock-customer-uuid',
              url: 'mock-customer-url',
              name: 'Mock Customer',
              projects: [],
            } as Customer
          }
          refetch={mockedRefetch}
        />
      </UIRouter>,
      { queryClient },
    );
  };

  beforeEach(() => {
    // Reset to default config values
    ENV.plugins.WALDUR_CORE.OECD_FOS_2007_CODE_MANDATORY = false;
    ENV.plugins.WALDUR_CORE.ENABLE_PROJECT_KIND_COURSE = false;
    ENV.FEATURES.project = {
      show_description_in_create_dialog: true,
      show_type_in_create_dialog: true,
    };
    vi.mocked(projectsList).mockResolvedValue({
      data: [],
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form correctly', async () => {
    vi.mocked(projectTypesList).mockResolvedValue({ data: [] } as any);
    renderComponent();
    // Assert that the form fields are rendered
    await waitFor(() => {
      expect(screen.getByText('Project name')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(screen.getByText('Project description')).toBeInTheDocument();
      expect(screen.queryByText('Project type')).not.toBeInTheDocument();
    });
  });

  it('should conceal disabled feature fields', async () => {
    // Modify the mock config for this specific test
    ENV.FEATURES.project.show_description_in_create_dialog = false;

    renderComponent();
    // Assert that the form fields are rendered
    await waitFor(() => {
      expect(screen.getByText('Project name')).toBeInTheDocument();
      expect(screen.getByText('Organization')).toBeInTheDocument();
      expect(screen.queryByText('Project description')).not.toBeInTheDocument();
      expect(screen.queryByText('Project type')).not.toBeInTheDocument();
    });
  });

  it('should create a new project using entered values', async () => {
    vi.mocked(projectTypesList).mockResolvedValue({ data: [] } as any);
    renderComponent();
    // Fill out the form
    await userEvent.type(screen.getByText('Project name'), 'Test Project');
    await userEvent.type(
      screen.getByText('Project description'),
      'This is a test project',
    );

    // Submit the form
    await userEvent.click(screen.getByText('Create'));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalledWith({
        body: {
          customer: 'mock-customer-url',
          name: 'Test Project',
          description: 'This is a test project',
          end_date: undefined,
          image: undefined,
          is_industry: undefined,
          oecd_fos_2007_code: undefined,
          start_date: undefined,
          type: undefined,
        },
        ...formDataOptions,
      });
      expect(mockedRefetch).toHaveBeenCalled();
    });
  });

  it('allows to select type if choices are available', async () => {
    vi.mocked(projectTypesList).mockResolvedValue({
      data: [{ name: 'Basic project type', url: 'basic-project-type-url' }],
    } as any);
    renderComponent();
    await userEvent.type(screen.getByText('Project name'), 'Test Project');
    screen.getByText('Project name').blur();

    await userEvent.type(
      screen.getByText('Project description'),
      'This is a test project',
    );
    // Step 1 has multiple comboboxes (Affiliation, Project type, ...);
    // scope to the Project type form group.
    const typeGroup = screen
      .getByText('Project type')
      .closest('div') as HTMLElement;
    await userEvent.click(within(typeGroup).getByRole('combobox'));
    await userEvent.click(screen.getByText('Basic project type'));

    // Submit the form
    await userEvent.click(screen.getByText('Create'));

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalledWith({
        body: {
          customer: 'mock-customer-url',
          name: 'Test Project',
          description: 'This is a test project',
          type: 'basic-project-type-url',
          end_date: undefined,
          image: undefined,
          is_industry: undefined,
          oecd_fos_2007_code: undefined,
          start_date: undefined,
        },
        ...formDataOptions,
      });
      expect(mockedRefetch).toHaveBeenCalled();
    });
  });

  it('shows error when project name is duplicate', async () => {
    vi.mocked(projectTypesList).mockResolvedValue({ data: [] } as any);
    vi.mocked(projectsList).mockResolvedValue({
      data: [{ name: 'Test Project', uuid: 'existing-uuid' }],
    } as any);

    renderComponent();

    const nameInput = screen.getByLabelText(/Project name/i);
    await userEvent.type(nameInput, 'Test Project');

    // Trigger validation (blur)
    nameInput.blur();

    await waitFor(() => {
      expect(
        screen.getByText('Name is duplicated. Choose other name.'),
      ).toBeInTheDocument();
    });

    // Should not submit
    await userEvent.click(screen.getByText('Create'));
    expect(projectsCreate).not.toHaveBeenCalled();
  });

  it('should NOT call projectsList when typing in description field', async () => {
    vi.mocked(projectTypesList).mockResolvedValue({ data: [] } as any);
    vi.mocked(projectsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    // Wait for form to be ready
    await waitFor(() => {
      expect(screen.getByText('Project description')).toBeInTheDocument();
    });

    // First, enter a valid project name (to pass pattern validation)
    const nameInput = screen.getByLabelText(/Project name/i);
    await userEvent.type(nameInput, 'Valid Project Name');

    // Wait for debounced validation to complete
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Clear any calls made during name entry
    vi.mocked(projectsList).mockClear();

    // Now type in the description field
    const descriptionInput = screen.getByPlaceholderText(
      'Enter a description...',
    );
    await userEvent.type(descriptionInput, 'This is a test description');

    // Wait a bit to ensure no delayed calls are made
    await new Promise((resolve) => setTimeout(resolve, 600));

    // projectsList should NOT have been called when typing in description
    expect(projectsList).not.toHaveBeenCalled();
  });
});
