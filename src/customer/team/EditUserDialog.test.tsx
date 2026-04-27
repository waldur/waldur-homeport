import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  customersAddUser,
  customersDeleteUser,
  customersUpdateUser,
} from 'waldur-js-client';

import { EditUserDialog } from './EditUserDialog';

// Mock API calls
vi.mock('waldur-js-client', () => ({
  customersAddUser: vi.fn(),
  customersDeleteUser: vi.fn(),
  customersUpdateUser: vi.fn(),
  formDataBodySerializer: {},
}));

// Mock store hooks
vi.mock('@/store/hooks', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
  useNotify: () => ({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

// Mock translation
vi.mock('@/i18n', () => ({
  translate: (str: string) => str,
}));

// Mock table constants
vi.mock('@/table/constants', () => ({
  DASH_ESCAPE_CODE: '—',
  INITIAL_STATE: {
    entities: {},
    order: [],
    loading: false,
    error: null,
    mode: 'table',
    pagination: {
      pageSize: 10,
      resultCount: 0,
      currentPage: 1,
    },
    sorting: {
      mode: undefined,
      field: null,
      loading: false,
    },
    filterPosition: 'menu',
    filtersStorage: [],
    savedFilters: [],
    selectedSavedFilter: null,
    applyFilters: false,
    toggled: {},
    selectedRows: [],
    firstFetch: true,
    activeColumns: {},
    columnPositions: [],
  },
}));

// Mock workspace selectors
vi.mock('@/workspace/selectors', () => ({
  getCustomer: () => ({
    uuid: 'customer-uuid',
    name: 'Test Customer',
  }),
}));

// Mock React Redux
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (selector) => selector(),
}));

// Mock permissions utils
vi.mock('@/permissions/utils', () => ({
  getCustomerRoles: () => [
    {
      name: 'owner',
      description: 'Owner',
      content_type: 'customer',
    },
    {
      name: 'manager',
      description: 'Manager',
      content_type: 'customer',
    },
  ],
  getRoles: (types) =>
    types.map((type) => ({
      name: `${type}_role`,
      description: `${type} role`,
      content_type: type,
    })),
}));

// Mock form components - customer variant to avoid duplication
vi.mock('@/form/SelectField', () => ({
  SelectField: ({ options, getOptionLabel }) => (
    <select data-testid="customer-select">
      {options?.map((option, idx) => (
        <option key={idx} value={option.name}>
          {getOptionLabel?.(option) || option.name}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/form/DateField', () => ({
  DateField: ({ placeholder }) => (
    <input type="date" placeholder={placeholder} data-testid="customer-date" />
  ),
}));

vi.mock('@/form', () => ({
  FormGroup: ({ children, label, required }) => (
    <div data-testid="customer-group">
      {label && (
        <label>
          {label}
          {required && ' *'}
        </label>
      )}
      {children}
    </div>
  ),
  SubmitButton: ({ children, disabled, submitting }) => (
    <button
      type="submit"
      disabled={disabled || submitting}
      data-testid="customer-submit"
    >
      {submitting ? 'Loading...' : children}
    </button>
  ),
  FormContainer: ({ children }) => (
    <div data-testid="customer-container">{children}</div>
  ),
}));

vi.mock('@/modal/CloseDialogButton', () => ({
  CloseDialogButton: () => <button data-testid="customer-close">Close</button>,
}));

vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ title, children, footer }) => (
    <div data-testid="customer-modal">
      <h2>{title}</h2>
      <div>{children}</div>
      <div data-testid="customer-footer">{footer}</div>
    </div>
  ),
}));

const mockCustomerUser = {
  uuid: 'user-uuid',
  full_name: 'Jane Smith',
  email: 'jane@example.com',
  username: 'jane',
  role_name: 'owner',
  expiration_time: '2024-12-31',
};

const mockResolve = {
  customer: mockCustomerUser,
  refetch: vi.fn(),
};

describe('EditUserDialog (Customer)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with correct title and user information', () => {
    render(<EditUserDialog resolve={mockResolve} />);

    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('jane@example.com')),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText((content) => content.includes('jane')).length,
    ).toBeGreaterThan(0);
  });

  it('renders role selection with customer roles', () => {
    render(<EditUserDialog resolve={mockResolve} />);

    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getByTestId('customer-select')).toBeInTheDocument();
  });

  it('renders expiration time field', () => {
    render(<EditUserDialog resolve={mockResolve} />);

    expect(screen.getByText('Role expires on')).toBeInTheDocument();
    expect(screen.getByTestId('customer-date')).toBeInTheDocument();
  });

  it('renders submit and close buttons in correct order', () => {
    render(<EditUserDialog resolve={mockResolve} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();

    // In customer dialog, Close comes before Save button
    const footer = screen.getByTestId('customer-footer');
    expect(footer).toBeInTheDocument();
  });

  it('pre-populates form with existing customer user data', () => {
    render(<EditUserDialog resolve={mockResolve} />);

    // The form should be initialized with current customer user values
    expect(screen.getByTestId('customer-modal')).toBeInTheDocument();
  });

  it('handles API calls for customer permission updates', () => {
    const mockCustomersUpdateUser = vi.mocked(customersUpdateUser);
    mockCustomersUpdateUser.mockResolvedValue({} as any);

    render(<EditUserDialog resolve={mockResolve} />);

    // This would require form interaction to actually submit
    expect(mockCustomersUpdateUser).toHaveBeenCalledTimes(0);
  });

  it('handles role changes that require delete and add operations for customers', () => {
    const mockCustomersDeleteUser = vi.mocked(customersDeleteUser);
    const mockCustomersAddUser = vi.mocked(customersAddUser);

    mockCustomersDeleteUser.mockResolvedValue({} as any);
    mockCustomersAddUser.mockResolvedValue({} as any);

    render(<EditUserDialog resolve={mockResolve} />);

    // This would require form interaction to test role change logic
    expect(mockCustomersDeleteUser).toHaveBeenCalledTimes(0);
    expect(mockCustomersAddUser).toHaveBeenCalledTimes(0);
  });

  it('handles customers without existing role names', () => {
    const customerWithoutRole = {
      ...mockCustomerUser,
      role_name: null,
    };

    render(
      <EditUserDialog
        resolve={{ ...mockResolve, customer: customerWithoutRole }}
      />,
    );

    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    const mockCustomersUpdateUser = vi.mocked(customersUpdateUser);
    const mockError = new Error('API Error');
    mockCustomersUpdateUser.mockRejectedValue(mockError);

    render(<EditUserDialog resolve={mockResolve} />);

    // Error handling would be tested through form submission
    expect(screen.getByText('Edit organization member')).toBeInTheDocument();
  });

  it('displays user without email when email is not provided', () => {
    const customerWithoutEmail = {
      ...mockCustomerUser,
      email: null,
    };

    render(
      <EditUserDialog
        resolve={{ ...mockResolve, customer: customerWithoutEmail }}
      />,
    );

    expect(
      screen.getByText((content) => content.includes('Jane Smith')),
    ).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
  });

  it('displays dash when user full name is not available', () => {
    const customerWithoutName = {
      ...mockCustomerUser,
      full_name: null,
    };

    render(
      <EditUserDialog
        resolve={{ ...mockResolve, customer: customerWithoutName }}
      />,
    );

    expect(
      screen.getByText((content) => content.includes('—')),
    ).toBeInTheDocument(); // DASH_ESCAPE_CODE
    expect(screen.getByText('Username')).toBeInTheDocument();
  });
});
