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

vi.mock('@/form/useFlatpickrTheme', () => ({
  useFlatpickrTheme: vi.fn(),
}));

vi.mock('@/form/SelectField', () => {
  return {
    SelectField: (props) => (
      <select
        id={props.id || props.input?.name}
        name={props.input?.name}
        value={
          typeof props.input?.value === 'object'
            ? props.getOptionValue?.(props.input.value) || props.input.value.url
            : props.input?.value || ''
        }
        onBlur={() => props.input?.onBlur?.()}
        onChange={(e) => {
          if (!props.input) return;
          const val = e.target.value;
          const option = props.options?.find(
            (o) => (props.getOptionValue?.(o) || o.url || o.name) === val,
          );
          props.input.onChange(option || val);
        }}
      >
        <option value="">Select...</option>
        {props.options?.map((o) => (
          <option
            key={props.getOptionValue?.(o) || o.url || o.name}
            value={props.getOptionValue?.(o) || o.url || o.name}
          >
            {props.getOptionLabel?.(o) || o.name || o.label}
          </option>
        ))}
      </select>
    ),
  };
});

vi.mock('@/form/DateField', () => ({
  DateField: (props) => (
    <input type="date" id={props.id || props.input?.name} {...props.input} />
  ),
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
    const projectSelect = await screen.findByLabelText('Project');
    fireEvent.change(projectSelect, { target: { value: 'project-url' } });
    fireEvent.blur(projectSelect);

    // Role Select
    const roleSelect = await screen.findByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'admin' } });
    fireEvent.blur(roleSelect);

    // Expiration Date
    const dateInput = await screen.findByLabelText('Role expires on');
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });
    fireEvent.blur(dateInput);

    // Submit
    const submitButton = await screen.findByTestId('submit-button');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
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
