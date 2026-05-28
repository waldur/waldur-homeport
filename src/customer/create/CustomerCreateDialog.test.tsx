import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { customersAddUser, customersCreate } from 'waldur-js-client';

import { RoleEnum } from '@/permissions/enums';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { getCurrentUser } from '@/user/UsersService';
import { useUser, useSetUser } from '@/workspace/hooks';

import * as constants from './constants';
import { CustomerCreateDialog } from './CustomerCreateDialog';

vi.mock('@/user/UsersService');

const mockUser = {
  uuid: 'test-user-uuid',
  name: 'Test User',
};

const mockSetUser = vi.fn();

describe('CustomerCreateDialog', () => {
  const renderComponent = (role = constants.ROLES.customer) => {
    return render(<CustomerCreateDialog resolve={{ role }} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue(mockUser as any);
    vi.mocked(useSetUser).mockReturnValue(mockSetUser);
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

  it('should validate required fields', () => {
    renderComponent();

    // Try to submit without filling any fields
    const createButton = screen.getByText('Create');
    expect(createButton).toBeDisabled();
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
    expect(createButton).toBeDisabled();
  });

  it('should create organization successfully for customer role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
    };

    const refreshedUser = {
      uuid: 'refreshed-user-uuid',
      name: 'Test User',
    };

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse as any);
    vi.mocked(getCurrentUser).mockResolvedValue(refreshedUser);

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
    await waitFor(() => {
      expect(customersCreate).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          email: 'test@example.com',
        },
      });
    });

    // Should not add user for customer role
    expect(customersAddUser).not.toHaveBeenCalled();

    // Check for success side-effects
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Organization has been created.',
      );
      expect(getCurrentUser).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(refreshedUser);
      expect(router.stateService.go).toHaveBeenCalledWith(
        'organization-manage',
        {
          uuid: 'new-customer-uuid',
        },
      );
    });
  });

  it('should create organization and add user for provider role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
    };

    const refreshedUser = {
      uuid: 'refreshed-user-uuid',
      name: 'Test User',
    };

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse as any);
    vi.mocked(customersAddUser).mockResolvedValue({} as any);
    vi.mocked(getCurrentUser).mockResolvedValue(refreshedUser);

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
    await waitFor(() => {
      expect(customersCreate).toHaveBeenCalledWith({
        body: {
          name: 'Test Organization',
          email: 'test@example.com',
        },
      });
    });

    // Should add user for provider role
    await waitFor(() => {
      expect(customersAddUser).toHaveBeenCalledWith({
        path: { uuid: 'new-customer-uuid' },
        body: {
          role: RoleEnum.CUSTOMER_OWNER,
          user: mockUser.uuid,
        },
      });
    });

    // Check for success side-effects
    await waitFor(() => {
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Organization has been created.',
      );
      expect(getCurrentUser).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(refreshedUser);
      expect(router.stateService.go).toHaveBeenCalledWith(
        'organization-manage',
        {
          uuid: 'new-customer-uuid',
        },
      );
    });
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
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        mockError,
        'Could not create organization',
      );
      // Should not navigate on error
      expect(router.stateService.go).not.toHaveBeenCalled();
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
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        networkError,
        'Could not create organization',
      );
      // Should not navigate on error
      expect(router.stateService.go).not.toHaveBeenCalled();
    });
  });

  it('should handle errors during user addition for provider role', async () => {
    const mockCustomerResponse = {
      data: {
        uuid: 'new-customer-uuid',
        name: 'Test Organization',
        email: 'test@example.com',
      },
    };

    const addUserError = new Error('Failed to add user');

    vi.mocked(customersCreate).mockResolvedValue(mockCustomerResponse as any);
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
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        addUserError,
        'Could not create organization',
      );
      // Should not navigate if user addition fails
      expect(router.stateService.go).not.toHaveBeenCalled();
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
      () => new Promise((resolve) => setTimeout(resolve, 100)) as any,
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
