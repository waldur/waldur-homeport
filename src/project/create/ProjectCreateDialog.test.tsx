import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  projectsCreate,
  projectsList,
  projectTypesList,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import * as workspaceHooks from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { ProjectCreateDialog } from './ProjectCreateDialog';
vi.mock('@/workspace/hooks');

// Mock API calls
vi.mock('../api');
vi.mock('waldur-js-client');

// Create a mocked config that can be modified in tests
const mockConfig = vi.hoisted(() => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        OECD_FOS_2007_CODE_MANDATORY: false,
        ENABLE_PROJECT_KIND_COURSE: false,
      },
    },
    FEATURES: {
      project: {
        show_description_in_create_dialog: true,
        show_type_in_create_dialog: true,
      },
    },
  },
}));

vi.mock('@/core/config', () => mockConfig);

describe('ProjectCreateDialog', () => {
  const mockedRefetch = vi.fn();

  const renderComponent = async () => {
    // Mock Redux store
    vi.mocked(workspaceHooks.useUser).mockReturnValue({
      is_staff: true,
      permissions: [],
    } as any);
    vi.mocked(projectsCreate).mockResolvedValue({
      data: { uuid: 'mock-project-uuid' },
    } as any);

    const router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);

    const queryClient = new QueryClient();
    // Prepare cache data
    queryClient.setQueryData(['CustomerProjects', 'mock-customer-uuid'], []);

    await render(
      <UIRouter router={router}>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </UIRouter>,
    );
  };

  beforeEach(() => {
    // Reset to default config values
    mockConfig.ENV = {
      plugins: {
        WALDUR_CORE: {
          OECD_FOS_2007_CODE_MANDATORY: false,
          ENABLE_PROJECT_KIND_COURSE: false,
        },
      },
      FEATURES: {
        project: {
          show_description_in_create_dialog: true,
          show_type_in_create_dialog: true,
        },
      },
    };
    vi.mocked(projectsList).mockResolvedValue({
      data: [],
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear mocks after each test
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
    mockConfig.ENV = {
      plugins: {
        WALDUR_CORE: {
          OECD_FOS_2007_CODE_MANDATORY: false,
          ENABLE_PROJECT_KIND_COURSE: false,
        },
      },
      FEATURES: {
        project: {
          show_description_in_create_dialog: false,
          show_type_in_create_dialog: true,
        },
      },
    };

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
