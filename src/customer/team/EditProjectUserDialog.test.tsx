import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  projectsAddUser,
  projectsDeleteUser,
  projectsUpdateUser,
} from 'waldur-js-client';

import { EditProjectUserDialog } from './EditProjectUserDialog';

vi.mock('waldur-js-client');

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

vi.mock('@/i18n/LanguageUtilsService', () => ({
  LanguageUtilsService: {
    getCurrentLanguage: () => ({ code: 'en' }),
    dictionary: {},
  },
}));

vi.mock('@/permissions/utils', () => ({
  getProjectRoles: () => [
    { name: 'admin', description: 'Admin', content_type: 'project' },
    { name: 'manager', description: 'Manager', content_type: 'project' },
  ],
  getRoles: () => [
    { name: 'admin', description: 'Admin', content_type: 'project' },
    { name: 'manager', description: 'Manager', content_type: 'project' },
  ],
}));

vi.mock('@/theme/useTheme', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

vi.mock('@/form/DateField', () => ({
  DateField: (props) => (
    <input
      id={props.inputId || props.id || props.input?.name}
      type="date"
      placeholder={props.placeholder}
      value={props.input.value || ''}
      onChange={props.input.onChange}
      className="form-control"
    />
  ),
}));

vi.mock('@/form/SelectField', () => ({
  SelectField: (props) => (
    <select
      id={props.inputId || props.id || props.input?.name}
      value={props.input.value?.name || props.input.value || ''}
      onChange={(e) => {
        const option = props.options.find((o) => o.name === e.target.value);
        props.input.onChange(option || e.target.value);
      }}
    >
      {props.options.map((option) => (
        <option key={option.name} value={option.name}>
          {option.description || option.name}
        </option>
      ))}
    </select>
  ),
}));

const mockStore = configureStore();

const renderComponent = (project, customer, refetch = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = mockStore({});
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <EditProjectUserDialog resolve={{ project, customer, refetch }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('EditProjectUserDialog', () => {
  const mockCustomer = {
    uuid: 'user-uuid',
    full_name: 'John Doe',
  };

  const mockProjectPermission = {
    uuid: 'permission-uuid',
    project_uuid: 'project-uuid',
    role_name: 'admin',
    expiration_time: '2025-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog correctly and pre-populates values', () => {
    renderComponent(mockProjectPermission, mockCustomer);
    expect(screen.getByText('Edit project member')).toBeInTheDocument();

    // Check hidden input for role value
    const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
    expect(roleSelect.value).toBe('admin');

    // Check DateField
    const dateInput = screen.getByPlaceholderText(
      'YYYY-MM-DD',
    ) as HTMLInputElement;
    expect(dateInput.value).toBe('2025-01-01');
  });

  it('calls projectsUpdateUser when role is unchanged', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsUpdateUser).mockResolvedValue({ data: {} } as any);
    const mockRefetch = vi.fn();
    renderComponent(mockProjectPermission, mockCustomer, mockRefetch);

    // Change only expiration date
    const dateInput = screen.getByPlaceholderText('YYYY-MM-DD');
    await user.clear(dateInput);
    await user.type(dateInput, '2025-12-31');

    // Submit
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsUpdateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'admin',
            expiration_time: '2025-12-31',
          }),
        }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('calls projectsDeleteUser and projectsAddUser when role is changed', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsDeleteUser).mockResolvedValue({ data: {} } as any);
    vi.mocked(projectsAddUser).mockResolvedValue({ data: {} } as any);
    const mockRefetch = vi.fn();
    renderComponent(mockProjectPermission, mockCustomer, mockRefetch);

    // Change role
    const roleSelect = screen.getByLabelText('Role');
    await user.selectOptions(roleSelect, 'manager');

    // Submit
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(projectsDeleteUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'admin',
          }),
        }),
      );
      expect(projectsAddUser).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'project-uuid' },
          body: expect.objectContaining({
            role: 'manager',
          }),
        }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
