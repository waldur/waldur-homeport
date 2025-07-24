import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  pushStateLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customersAddUser, customersCreate } from 'waldur-js-client';

import { RoleEnum } from '@waldur/permissions/enums';
import { getCurrentUser } from '@waldur/user/UsersService';

import * as constants from './constants';
import { CustomerCreateDialog } from './CustomerCreateDialog';

// Mock API calls
vi.mock('waldur-js-client');
vi.mock('@waldur/user/UsersService');

// Mock i18n
vi.mock('@waldur/i18n', () => ({
  translate: (message: string) => message,
}));

// Mock notify hooks
vi.mock('@waldur/store/notify', () => ({
  showSuccess: vi.fn(() => ({ type: 'SHOW_SUCCESS' })),
  showErrorResponse: vi.fn(() => ({ type: 'SHOW_ERROR_RESPONSE' })),
}));

// Mock workspace actions
vi.mock('@waldur/workspace/actions', () => ({
  setCurrentUser: vi.fn((user) => ({
    type: 'SET_CURRENT_USER',
    payload: user,
  })),
}));

describe('CustomerCreateDialog', () => {
  const mockRouter = {
    stateService: {
      go: vi.fn(),
    },
  };

  const renderComponent = (role = constants.ROLES.customer) => {
    // Mock Redux store with middleware
    const mockStore = createStore((state: any = {}, action: any) => {
      switch (action.type) {
        case 'SET_CURRENT_USER':
          return {
            ...(state || {}),
            workspace: {
              ...(state?.workspace || {}),
              user: action.payload,
            },
          };
        case 'SHOW_SUCCESS':
        case 'SHOW_ERROR_RESPONSE':
          return state;
        default:
          return {
            workspace: {
              user: {
                uuid: 'test-user-uuid',
                is_staff: true,
                permissions: [],
              },
            },
          };
      }
    });

    const router = new UIRouterReact();
    router.plugin(servicesPlugin);
    router.plugin(pushStateLocationPlugin);
    // Mock the stateService
    router.stateService = mockRouter.stateService as any;

    return render(
      <Provider store={mockStore}>
        <UIRouter router={router}>
          <CustomerCreateDialog resolve={{ role }} />
        </UIRouter>
      </Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form correctly', () => {
    renderComponent();

    // Assert that the form fields are rendered
    expect(screen.getByText('Create an organization')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Provide the required information to create a new organization.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Contact email')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    renderComponent();

    // Try to submit without filling any fields
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Form should not submit and validation errors should be visible
    expect(customersCreate).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    renderComponent();

    // Fill in name field
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    await userEvent.type(nameInput, 'Test Organization');

    // Fill in invalid email
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);
    await userEvent.type(emailInput, 'invalid-email');

    // Try to submit
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Form should not submit due to invalid email
    expect(customersCreate).not.toHaveBeenCalled();
  });

  it('should create organization successfully for customer role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
      request: {} as Request,
      response: {} as Response,
    };

    const mockUser = {
      uuid: 'updated-user-uuid',
      name: 'Test User',
    };

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse);
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    renderComponent(constants.ROLES.customer);

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Test Organization');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit the form
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Wait for the API call
    await waitFor(
      () => {
        expect(customersCreate).toHaveBeenCalledWith({
          body: {
            name: 'Test Organization',
            email: 'test@example.com',
          },
        });
      },
      { timeout: 3000 },
    );

    // Should not add user for customer role
    expect(customersAddUser).not.toHaveBeenCalled();
  });

  it('should create organization and add user for provider role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
      request: {} as Request,
      response: {} as Response,
    };

    const mockUser = {
      uuid: 'updated-user-uuid',
      name: 'Test User',
    };

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse);
    vi.mocked(customersAddUser).mockResolvedValue({} as any);
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);

    renderComponent(constants.ROLES.provider);

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Test Organization');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit the form
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Wait for the API calls
    await waitFor(
      () => {
        expect(customersCreate).toHaveBeenCalledWith({
          body: {
            name: 'Test Organization',
            email: 'test@example.com',
          },
        });
      },
      { timeout: 3000 },
    );

    // Should add user for provider role
    await waitFor(
      () => {
        expect(customersAddUser).toHaveBeenCalledWith({
          path: { uuid: 'new-customer-uuid' },
          body: {
            role: RoleEnum.CUSTOMER_OWNER,
            user: 'test-user-uuid',
          },
        });
      },
      { timeout: 3000 },
    );
  });

  it('should handle API errors during organization creation', async () => {
    const mockError = {
      status: 400,
      data: {
        name: ['Organization with this name already exists.'],
      },
    };

    vi.mocked(customersCreate).mockRejectedValue(mockError);

    renderComponent();

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Duplicate Organization');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit the form
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Wait for error handling
    await waitFor(() => {
      expect(customersCreate).toHaveBeenCalled();
      // Should not navigate on error
      expect(mockRouter.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('should handle network errors during organization creation', async () => {
    const networkError = new Error('Network error');

    vi.mocked(customersCreate).mockRejectedValue(networkError);

    renderComponent();

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Test Organization');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit the form
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Wait for error handling
    await waitFor(() => {
      expect(customersCreate).toHaveBeenCalled();
      // Should not navigate on error
      expect(mockRouter.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('should handle errors during user addition for provider role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
      request: {} as Request,
      response: {} as Response,
    };

    const addUserError = new Error('Failed to add user');

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse);
    vi.mocked(customersAddUser).mockRejectedValue(addUserError);

    renderComponent(constants.ROLES.provider);

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Test Organization');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit the form
    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(customersCreate).toHaveBeenCalled();
      expect(customersAddUser).toHaveBeenCalled();
      // Should not navigate if user addition fails
      expect(mockRouter.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('should disable submit button when form is invalid', () => {
    renderComponent();

    const createButton = screen.getByText('Create');

    // Button should be disabled when form is empty (invalid)
    expect(createButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    renderComponent();

    const createButton = screen.getByText('Create');
    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    // Initially disabled
    expect(createButton).toBeDisabled();

    // Fill valid data
    await userEvent.type(nameInput, 'Valid Organization');
    await userEvent.type(emailInput, 'valid@example.com');

    // Should be enabled now
    await waitFor(() => {
      expect(createButton).toBeEnabled();
    });
  });

  it('should show loading state during submission', async () => {
    // Mock a slow API response
    vi.mocked(customersCreate).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    renderComponent();

    const nameInput = screen.getByPlaceholderText('e.g. My Organization');
    const emailInput = screen.getByPlaceholderText(/someone@example.com/);

    await userEvent.type(nameInput, 'Test Organization');
    await userEvent.type(emailInput, 'test@example.com');

    const createButton = screen.getByText('Create');
    await userEvent.click(createButton);

    // Should show loading state (button disabled during submission)
    expect(createButton).toBeDisabled();
  });
});
