import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  usersChangePassword,
  usersCreate,
  usersPartialUpdate,
  usersRemovePassword,
  customersCountriesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { useSetUser, useUser } from '@/workspace/hooks';

import { UserFormDialog } from './UserFormDialog';

const handleUnhandledRejection = () => {};

describe('UserFormDialog', () => {
  const user = userEvent.setup();
  const mockRefetch = vi.fn();
  let originalProfileAttributes;

  beforeAll(() => process.on('unhandledRejection', handleUnhandledRejection));
  afterAll(() => process.off('unhandledRejection', handleUnhandledRejection));

  beforeEach(() => {
    vi.clearAllMocks();
    originalProfileAttributes =
      ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES;

    // Enable all profile attributes for comprehensive test coverage
    ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES = [
      'native_name',
      'phone_number',
      'personal_title',
      'gender',
      'place_of_birth',
      'country_of_residence',
      'nationality',
      'nationalities',
      'organization_country',
      'organization_type',
      'organization_registry_code',
    ];

    vi.mocked(customersCountriesList).mockResolvedValue({
      data: [
        { label: 'Estonia', value: 'EE' },
        { label: 'Germany', value: 'DE' },
        { label: 'United States', value: 'US' },
      ],
    } as any);

    vi.mocked(useUser).mockReturnValue({
      uuid: 'current-user-uuid',
      username: 'current-user',
    } as any);

    const mockSetUser = vi.fn();
    vi.mocked(useSetUser).mockReturnValue(mockSetUser);
  });

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.ENABLED_USER_PROFILE_ATTRIBUTES =
      originalProfileAttributes;
  });

  const fillAccountStep = async (
    username = 'john.doe',
    email = 'john@example.com',
    password = 'SecretPassword123!',
  ) => {
    await user.type(screen.getByLabelText(/Username/i), username);
    await user.type(screen.getByLabelText(/Email/i), email);
    await user.click(screen.getByLabelText(/Staff/i));
    await user.click(screen.getByLabelText(/Support/i));
    await user.click(screen.getByLabelText(/Personal access tokens/i));

    if (password) {
      const passwordInput = screen.getByPlaceholderText(
        'Password',
      ) as HTMLInputElement;
      await user.type(passwordInput, password);
    }
  };

  const fillPersonalInfoStep = async () => {
    await user.type(screen.getByLabelText(/First name/i), 'John');
    await user.type(screen.getByLabelText(/Last name/i), 'Doe');
    await user.type(screen.getByLabelText(/Native name/i), 'Juhan');
    await user.type(screen.getByLabelText(/Organization name/i), 'Waldur Org');
    await user.type(screen.getByLabelText(/Job position/i), 'Developer');
    await user.type(screen.getByLabelText(/Phone number/i), '+3725555555');
    await user.type(screen.getByLabelText(/Description/i), 'Test description');
  };

  const fillIdentityStep = async () => {
    await openAndSelectOption(user, /Personal title/i, 'Dr');
    await openAndSelectOption(user, /Gender/i, 'Male');
    await user.type(screen.getByLabelText(/Place of birth/i), 'Tallinn');
    await openAndSelectOption(user, /Country of residence/i, 'Estonia');
    await openAndSelectOption(user, /Nationality/i, 'Germany');
    await openAndSelectOption(user, /Nationalities/i, 'United States');
    await openAndSelectOption(user, /Organization country/i, 'Estonia');
    await openAndSelectOption(user, /Organization type/i, 'Company');
    await user.type(
      screen.getByLabelText(/Organization registry code/i),
      '123456',
    );
  };

  it('handles creation flow successfully through all steps', async () => {
    vi.mocked(usersCreate).mockResolvedValueOnce({
      data: { uuid: 'new-user-uuid', username: 'john.doe' },
    } as any);
    vi.mocked(usersChangePassword).mockResolvedValueOnce({} as any);

    renderWithProviders(<UserFormDialog resolve={{ refetch: mockRefetch }} />);

    // Step 1: Account
    expect(screen.getByText('Account')).toBeInTheDocument();
    await fillAccountStep();
    await user.click(screen.getByTestId('wizard-submit-btn'));

    // Step 2: Personal information
    await waitFor(() => {
      expect(screen.getByText('Personal information')).toBeInTheDocument();
    });
    await fillPersonalInfoStep();
    await user.click(screen.getByTestId('wizard-submit-btn'));

    // Step 3: Identity & Profile
    await waitFor(() => {
      expect(screen.getByText('Identity & Profile')).toBeInTheDocument();
    });
    await fillIdentityStep();
    await user.click(screen.getByTestId('wizard-submit-btn'));

    // Step 4: Review
    await waitFor(() => {
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    // Check displayed values in ReviewStep
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Juhan')).toBeInTheDocument();
    expect(screen.getByText('Waldur Org')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('+3725555555')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Dr')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Tallinn')).toBeInTheDocument();

    // Country and nationalities are displayed by their code or list values in ReviewRow
    expect(screen.getAllByText('EE').length).toBeGreaterThan(0); // Country of residence, Organization country
    expect(screen.getByText('DE')).toBeInTheDocument(); // Nationality
    expect(screen.getByText('US')).toBeInTheDocument(); // Nationalities
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();

    const createBtn = screen.getByTestId('wizard-submit-btn');
    expect(createBtn).toHaveTextContent('Create');
    await user.click(createBtn);

    await waitFor(() => {
      expect(usersCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          username: 'john.doe',
          email: 'john@example.com',
          is_active: true,
          is_staff: true,
          is_support: true,
          can_use_personal_access_tokens: true,
          first_name: 'John',
          last_name: 'Doe',
          native_name: 'Juhan',
          organization: 'Waldur Org',
          job_title: 'Developer',
          phone_number: '+3725555555',
          description: 'Test description',
          personal_title: 'Dr',
          gender: 'male',
          place_of_birth: 'Tallinn',
          country_of_residence: 'EE',
          nationality: 'DE',
          nationalities: ['US'],
          organization_country: 'EE',
          organization_type: 'urn:schac:homeOrganizationType:int:company',
          organization_registry_code: '123456',
        }),
      });

      expect(usersChangePassword).toHaveBeenCalledWith({
        path: { uuid: 'new-user-uuid' },
        body: { new_password: 'SecretPassword123!' },
      });

      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been created.',
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });

  it('runs field validations in Account Step', async () => {
    renderWithProviders(<UserFormDialog resolve={{ refetch: mockRefetch }} />);

    // Focus and blur fields to trigger touched validations
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.focus(usernameInput);
    fireEvent.blur(usernameInput);

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);

    // React Final Form fields are required
    await waitFor(() => {
      const requiredErrors = screen.getAllByText('This field is required.');
      expect(requiredErrors.length).toBeGreaterThan(0);
    });

    // Invalid email check
    await user.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    // Invalid username character check
    await user.type(usernameInput, 'John Doe');
    fireEvent.blur(usernameInput);
    await waitFor(() => {
      expect(
        screen.getByText(
          'Only lowercase letters, numbers, and @/./+/-/_ characters are allowed.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('generates a password when clicking Generate button', async () => {
    renderWithProviders(<UserFormDialog resolve={{ refetch: mockRefetch }} />);
    const generateBtn = screen.getByRole('button', { name: /Generate/i });

    const passwordInput = screen.getByPlaceholderText(
      'Password',
    ) as HTMLInputElement;
    expect(passwordInput.value).toBe('');

    await user.click(generateBtn);
    expect(passwordInput.value).not.toBe('');
    expect(passwordInput.value.length).toBe(16);
  });

  it('handles edition flow and updates current user state if editing self', async () => {
    const existingUser = {
      uuid: 'current-user-uuid',
      username: 'john.doe',
      email: 'john@example.com',
      is_active: true,
      is_staff: true,
      is_support: false,
      can_use_personal_access_tokens: false,
      first_name: 'John',
      last_name: 'Doe',
      has_usable_password: true,
    } as any;

    vi.mocked(usersPartialUpdate).mockResolvedValueOnce({
      data: {
        ...existingUser,
        email: 'john.updated@example.com',
        is_support: true,
      },
    } as any);
    vi.mocked(usersRemovePassword).mockResolvedValueOnce({} as any);

    renderWithProviders(
      <UserFormDialog resolve={{ user: existingUser, refetch: mockRefetch }} />,
    );

    // Verify fields are pre-filled
    expect(screen.getByLabelText(/Username/i)).toHaveValue('john.doe');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com');
    expect(screen.getByLabelText(/Staff/i)).toBeChecked();
    expect(screen.getByLabelText(/Support/i)).not.toBeChecked();

    // Trigger Remove password
    await user.click(screen.getByRole('button', { name: /Remove password/i }));
    expect(
      screen.getByText('Password will be removed when you save.'),
    ).toBeInTheDocument();

    // Update Email
    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(
      screen.getByLabelText(/Email/i),
      'john.updated@example.com',
    );

    // Enable Support role
    await user.click(screen.getByLabelText(/Support/i));

    // Advance to step 4 by clicking Next multiple times (Skip step 2 and 3 validation since fields are optional)
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 2
    await waitFor(() =>
      expect(screen.getByText('Personal information')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 3
    await waitFor(() =>
      expect(screen.getByText('Identity & Profile')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 4 (Review)

    await waitFor(() => expect(screen.getByText('Review')).toBeInTheDocument());
    expect(screen.getByText('Will be removed')).toBeInTheDocument();

    // Save
    const saveBtn = screen.getByTestId('wizard-submit-btn');
    expect(saveBtn).toHaveTextContent('Save');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(usersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'current-user-uuid' },
        body: expect.objectContaining({
          username: 'john.doe',
          email: 'john.updated@example.com',
          is_staff: true,
          is_support: true,
        }),
      });

      expect(usersRemovePassword).toHaveBeenCalledWith({
        path: { uuid: 'current-user-uuid' },
      });

      // Assert that SetUser is called to update local session since user is self
      expect(useSetUser()).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: 'current-user-uuid',
          email: 'john.updated@example.com',
          is_support: true,
        }),
      );

      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'User has been updated.',
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });

  it('shows error notification when save fails on create user API', async () => {
    vi.mocked(usersCreate).mockRejectedValueOnce(new Error('Creation failure'));

    renderWithProviders(<UserFormDialog resolve={{ refetch: mockRefetch }} />);

    await fillAccountStep('error.user', 'error@example.com');
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 2
    await waitFor(() =>
      expect(screen.getByText('Personal information')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 3
    await waitFor(() =>
      expect(screen.getByText('Identity & Profile')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 4
    await waitFor(() => expect(screen.getByText('Review')).toBeInTheDocument());

    await user.click(screen.getByTestId('wizard-submit-btn')); // Submit

    await waitFor(() => {
      expect(usersCreate).toHaveBeenCalled();
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'Unable to create user.',
      );
      // Dialog should remain open
      expect(useModal().closeDialog).not.toHaveBeenCalled();
    });
  });

  it('shows password error notification but still calls refetch & closes dialog if user was saved but password update failed', async () => {
    vi.mocked(usersCreate).mockResolvedValueOnce({
      data: { uuid: 'new-user-uuid', username: 'john.doe' },
    } as any);
    vi.mocked(usersChangePassword).mockRejectedValueOnce(
      new Error('Password change failed'),
    );

    renderWithProviders(<UserFormDialog resolve={{ refetch: mockRefetch }} />);

    await fillAccountStep();
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 2
    await waitFor(() =>
      expect(screen.getByText('Personal information')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 3
    await waitFor(() =>
      expect(screen.getByText('Identity & Profile')).toBeInTheDocument(),
    );
    await user.click(screen.getByTestId('wizard-submit-btn')); // to step 4
    await waitFor(() => expect(screen.getByText('Review')).toBeInTheDocument());

    await user.click(screen.getByTestId('wizard-submit-btn')); // Submit

    await waitFor(() => {
      expect(usersCreate).toHaveBeenCalled();
      expect(usersChangePassword).toHaveBeenCalled();
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'User was saved but password could not be updated.',
      );
      expect(mockRefetch).toHaveBeenCalled();
      expect(useModal().closeDialog).toHaveBeenCalled();
    });
  });
});
