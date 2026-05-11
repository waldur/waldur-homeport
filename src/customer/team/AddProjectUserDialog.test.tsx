import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { projectsAddUser } from 'waldur-js-client';

import { AddProjectUserDialog } from './AddProjectUserDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    projectsAddUser: vi.fn(),
  };
});

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('@/permissions/utils', () => ({
  getRoles: () => [
    { name: 'admin', description: 'Admin', content_type: 'project' },
  ],
}));

vi.mock('@/workspace/selectors', () => ({
  getCustomer: () => ({
    projects: [
      { uuid: 'project-uuid', name: 'Test Project', url: 'project-url' },
    ],
  }),
}));

vi.mock('../workspace/fetchCustomer', () => ({
  useCustomerProjects: () => ({ loading: false }),
}));

vi.mock('@/marketplace/offerings/FormGroup', () => ({
  FormGroup: ({ label, children }) => (
    <div>
      {label && (
        <label>
          {label}
          {children}
        </label>
      )}
      {!label && children}
    </div>
  ),
}));

// Mock form fields to avoid complex dependencies
vi.mock('@/form/SelectField', () => ({
  SelectField: ({ input, options, getOptionLabel, getOptionValue }) => (
    <select
      {...input}
      onChange={(e) => {
        const val = e.target.value;
        const option = options.find((o) => getOptionValue(o) === val);
        input.onChange(option || val);
      }}
    >
      <option value="">Select...</option>
      {options?.map((o) => (
        <option key={getOptionValue(o)} value={getOptionValue(o)}>
          {getOptionLabel(o)}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/form/DateField', () => ({
  DateField: ({ input }) => <input type="date" {...input} />,
}));

const mockStore = configureStore();

const renderComponent = (customer, refetch = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = mockStore({});
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AddProjectUserDialog resolve={{ customer, refetch }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('AddProjectUserDialog', () => {
  const mockCustomer = {
    uuid: 'user-uuid',
    full_name: 'John Doe',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog correctly', () => {
    renderComponent(mockCustomer);
    expect(screen.getByText('Add project role')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByText('Role expires on')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    vi.mocked(projectsAddUser).mockResolvedValue({ data: {} } as any);
    renderComponent(mockCustomer);

    // Fill the form
    // Project Select
    const projectSelect = screen.getByLabelText('Project');
    fireEvent.change(projectSelect, { target: { value: 'project-url' } });

    // Role Select
    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    // Expiration Date
    const dateInput = screen.getByLabelText('Role expires on');
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

    // Submit
    const submitButton = screen.getByText('Save');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(projectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            user: 'user-uuid',
            role: 'admin',
            expiration_time: '2025-01-01',
          }),
        }),
      );
    });
  });
});
