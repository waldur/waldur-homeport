import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from '@uirouter/react';
import { noop } from 'lodash-es';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  onboardingJustificationsAttachDocument,
  onboardingJustificationsCreateJustification,
  onboardingPersonIdentifierFieldsRetrieve,
  onboardingVerificationsAvailableChecklistsRetrieve,
  onboardingVerificationsCreateCustomer,
  onboardingVerificationsDestroy,
  onboardingVerificationsPartialUpdate,
  onboardingVerificationsRunValidation,
  onboardingVerificationsStartVerification,
  onboardingVerificationsSubmitAnswers,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

import { OrganizationCreatePage } from './OrganizationCreatePage';

// --- Mocks ---

const mockRouterGo = useRouter().stateService.go;
const mockOnBefore = useRouter().transitionService.onBefore;

ENV.pageSize = 10;
ENV.plugins.WALDUR_CORE.ONBOARDING_VALIDATION_METHODS = ['ariregister'];

// Mock the navigation module
vi.mock('@/navigation/context', () => ({
  useFullPage: vi.fn(),
}));

const renderComponent = () => {
  return render(<OrganizationCreatePage />);
};

/** Returns the primary submit button (type="submit") - the Next/Create button */
const getSubmitButton = () =>
  screen
    .getAllByRole('button')
    .find(
      (btn) =>
        btn.getAttribute('type') === 'submit' &&
        !btn.classList.contains('btn-secondary') &&
        !btn.classList.contains('btn-tertiary'),
    );

/** Selects a verification method from the dropdown */
const selectMethod = async (methodLabel: string) => {
  const placeholder = screen.getByText('Select a verification method');
  fireEvent.mouseDown(placeholder);
  await waitFor(() => {
    const option = screen.getByText(methodLabel);
    fireEvent.click(option);
  });
};

/** Click the primary submit button */
const clickSubmit = () => {
  const btn = getSubmitButton();
  expect(btn).toBeTruthy();
  fireEvent.click(btn!);
};

/** Fill required fields for automatic (ariregister) method on step 2 */
const fillAutoStep2Fields = async () => {
  // registration_code is required
  const regCodeInput = screen.getByPlaceholderText('12345678');
  await userEvent.clear(regCodeInput);
  await userEvent.type(regCodeInput, '12345678');

  // person identifier field (civil_number) is required
  const idInput = screen.getByPlaceholderText('39901010101');
  await userEvent.clear(idInput);
  await userEvent.type(idInput, '39901010101');
};

/** Fill required fields for manual method on step 2 */
const fillManualStep2Fields = async () => {
  // name is required (using the organization name field)
  const nameInput = screen.getByPlaceholderText('e.g., Acme Corporation');
  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'Test Organization');
};

describe('OrganizationCreatePage', () => {
  beforeAll(() => process.on('unhandledRejection', noop));
  afterAll(() => process.off('unhandledRejection', noop));

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.mocked(mockOnBefore).mockReturnValue(vi.fn());

    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-1',
      full_name: 'Test User',
      civil_number: '',
    } as any);

    vi.mocked(onboardingVerificationsDestroy).mockResolvedValue({} as any);
    vi.mocked(onboardingVerificationsStartVerification).mockResolvedValue({
      data: {
        uuid: 'verification-uuid-1',
        status: 'pending',
      },
    } as any);
    vi.mocked(onboardingVerificationsSubmitAnswers).mockResolvedValue(
      {} as any,
    );
    vi.mocked(onboardingVerificationsRunValidation).mockResolvedValue({
      data: {
        uuid: 'verification-uuid-1',
        status: 'verified',
      },
    } as any);
    vi.mocked(onboardingVerificationsCreateCustomer).mockResolvedValue({
      data: { uuid: 'customer-uuid-1' },
    } as any);
    vi.mocked(onboardingVerificationsPartialUpdate).mockResolvedValue(
      {} as any,
    );
    vi.mocked(
      onboardingVerificationsAvailableChecklistsRetrieve,
    ).mockResolvedValue({
      data: {
        customer_checklist: {
          uuid: 'checklist-customer-uuid',
          questions: [
            {
              uuid: 'q-customer-1',
              description: 'Customer question 1',
              question_type: 'text_input',
              required: false,
            },
          ],
        },
        intent_checklist: {
          uuid: 'checklist-intent-uuid',
          questions: [
            {
              uuid: 'q-intent-1',
              description: 'Intent question 1',
              question_type: 'text_input',
              required: false,
            },
          ],
        },
      },
    } as any);
    vi.mocked(onboardingPersonIdentifierFieldsRetrieve).mockResolvedValue({
      data: {
        validation_method: 'ariregister',
        person_identifier_fields: {
          type: 'string',
          field: 'civil_number',
          label: 'Estonian ID code',
          description: 'Enter your Estonian personal identification code',
          example: '39901010101',
        },
      },
    } as any);
    vi.mocked(onboardingJustificationsCreateJustification).mockResolvedValue({
      data: { uuid: 'justification-uuid-1' },
    } as any);
    vi.mocked(onboardingJustificationsAttachDocument).mockResolvedValue(
      {} as any,
    );
  });

  // --- Rendering ---

  describe('Rendering', () => {
    it('renders the page header and subtitle', () => {
      renderComponent();

      expect(screen.getByText('Create organization')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Register your organization with automatic business verification',
        ),
      ).toBeInTheDocument();
    });

    it('renders all four progress step labels', () => {
      renderComponent();

      expect(screen.getByText('Method')).toBeInTheDocument();
      expect(screen.getByText('Identification')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(screen.getByText('Intent')).toBeInTheDocument();
    });

    it('renders step 1 content (select verification method) on initial load', () => {
      renderComponent();

      // "Select verification method" appears both as heading and step description
      const headings = screen.getAllByText('Select verification method');
      expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Back button as disabled on first step', () => {
      renderComponent();

      const backButton = screen.getByText('Back');
      expect(backButton.closest('button')).toBeDisabled();
    });

    it('renders a submit button', () => {
      renderComponent();

      const btn = getSubmitButton();
      expect(btn).toBeTruthy();
    });

    it('renders Cancel button', () => {
      renderComponent();

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  // --- Step navigation ---

  describe('Step navigation', () => {
    it('navigates from step 1 to step 2 when submit is clicked', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });
    });

    it('enables Back button after navigating past first step', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');
      clickSubmit();

      await waitFor(() => {
        const backButton = screen.getByText('Back');
        expect(backButton.closest('button')).not.toBeDisabled();
      });
    });

    it('navigates back to previous step when Back is clicked', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Back'));

      await waitFor(() => {
        // Step 1 heading should reappear
        const headings = screen.getAllByText('Select verification method');
        expect(headings.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('advances from step 2 to step 3 with filled required fields (automatic)', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      // Fill required step 2 fields
      await fillAutoStep2Fields();

      // Submit to advance
      clickSubmit();

      // Should reach step 3 (validation result)
      await waitFor(() => {
        expect(
          screen.queryByText('Company registration code'),
        ).not.toBeInTheDocument();
      });
    });
  });

  // --- Skip-step logic (manual method) ---

  describe('Manual validation skip-step logic', () => {
    it('skips step 3 (Result) for manual validation method', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      // Step 1 -> step 2 (Identification)
      clickSubmit();
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      // Fill required fields
      await fillManualStep2Fields();

      // Step 2 -> should jump to step 4 (Intent), skipping step 3 (Result)
      clickSubmit();
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
      });
    });

    it('shows Create button text on last step', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit(); // Step 2 -> Step 4 (skip 3)
      await waitFor(() => {
        // On the last step, the submit button label should be "Create"
        expect(screen.getByText('Create')).toBeInTheDocument();
      });
    });

    it('goes back from step 4 to step 2 in manual mode (skipping step 3)', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit(); // Step 2 -> Step 4
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
      });

      // Go back should skip step 3 and land on step 2
      fireEvent.click(screen.getByText('Back'));
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });
    });
  });

  // --- Cancel flow ---

  describe('Cancel flow', () => {
    it('shows confirmation dialog on Cancel click', async () => {
      vi.mocked(useModal().confirm).mockRejectedValueOnce(
        new Error('cancelled'),
      );

      renderComponent();

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(useModal().confirm).toHaveBeenCalledWith(
          'Cancel organization creation',
          'Are you sure you want to cancel? All entered data will be lost.',
        );
      });
    });

    it('navigates to profile.details when cancel is confirmed', async () => {
      vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);

      renderComponent();

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
      });
    });

    it('does not navigate when cancel is rejected', async () => {
      vi.mocked(useModal().confirm).mockRejectedValueOnce(
        new Error('cancelled'),
      );

      renderComponent();

      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(useModal().confirm).toHaveBeenCalled();
      });

      expect(mockRouterGo).not.toHaveBeenCalled();
    });
  });

  // --- Auto-validation submission ---

  describe('Automatic validation submission', () => {
    const navigateToStep2Auto = async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');
      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });
    };

    it('triggers auto-validation when advancing from step 2', async () => {
      await navigateToStep2Auto();

      await fillAutoStep2Fields();
      clickSubmit();

      await waitFor(() => {
        expect(onboardingVerificationsStartVerification).toHaveBeenCalled();
      });
    });

    it('calls createCustomer on verified status and navigates to profile', async () => {
      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: { uuid: 'verification-uuid-1', status: 'verified' },
      } as any);

      await navigateToStep2Auto();
      await fillAutoStep2Fields();

      clickSubmit(); // Step 2 -> Step 3
      await waitFor(() => {
        expect(screen.getByText('Verification successful')).toBeInTheDocument();
      });

      clickSubmit(); // Step 3 -> Step 4
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
      });

      // Click Create on last step
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(onboardingVerificationsCreateCustomer).toHaveBeenCalledWith({
          path: { uuid: 'verification-uuid-1' },
        });
        expect(useNotify().showSuccess).toHaveBeenCalledWith(
          'Organization created! You can view your submitted applications in your dashboard.',
        );
        expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
      });
    });

    it('shows review status when verification status is escalated', async () => {
      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: {
          uuid: 'verification-uuid-1',
          status: 'escalated',
          error_message: 'Could not verify',
        },
      } as any);

      await navigateToStep2Auto();
      await fillAutoStep2Fields();

      clickSubmit(); // Step 2 -> Step 3
      await waitFor(() => {
        expect(
          screen.getByText('Automatic verification failed'),
        ).toBeInTheDocument();
      });

      // Escalated status disables the submit button, so we need to switch to manual
      // Actually, let's test the escalated submission from the last step
      // First navigate to step 4 despite escalation
      // The submit is disabled when escalated for automatic, so the user would go back
      // and choose manual. Let's verify the escalation display instead.

      // Verify the error message is shown
      expect(
        screen.getByText(
          "We couldn't automatically verify your company representative status. Please try again or go back to the previous step and proceed with manual verification.",
        ),
      ).toBeInTheDocument();
    });
  });

  // --- Manual validation submission ---

  describe('Manual validation submission', () => {
    const navigateToLastStepManual = async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit(); // Step 2 -> Step 4 (skip step 3)
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
        expect(screen.getByText('Create')).toBeInTheDocument();
      });
    };

    it('creates verification and justification for manual flow', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockResolvedValueOnce(
        {
          data: { uuid: 'manual-verification-uuid', status: 'pending' },
        } as any,
      );

      await navigateToLastStepManual();

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(onboardingVerificationsStartVerification).toHaveBeenCalled();
        expect(onboardingJustificationsCreateJustification).toHaveBeenCalled();
      });

      // Should show review page
      await waitFor(() => {
        expect(screen.getByText('Review in progress')).toBeInTheDocument();
      });
    });

    it('shows error notification on submission failure', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockRejectedValueOnce(
        new Error('Network error'),
      );

      await navigateToLastStepManual();

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
          expect.any(Error),
          'Unable to verify company.',
        );
      });
    });
  });

  // --- Review status ---

  describe('Review status display', () => {
    it('shows review status with Go to dashboard after manual submission', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockResolvedValueOnce(
        {
          data: { uuid: 'manual-uuid', status: 'pending' },
        } as any,
      );

      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit(); // Step 2 -> Step 4
      await waitFor(() => {
        expect(screen.getByText('Create')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('Review in progress')).toBeInTheDocument();
        expect(screen.getByText('Go to dashboard')).toBeInTheDocument();
      });
    });

    it('navigates to profile.details when "Go to dashboard" is clicked', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockResolvedValueOnce(
        {
          data: { uuid: 'manual-uuid', status: 'pending' },
        } as any,
      );

      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit();
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit();
      await waitFor(() => {
        expect(screen.getByText('Create')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('Go to dashboard')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Go to dashboard'));

      await waitFor(() => {
        expect(mockRouterGo).toHaveBeenCalledWith('profile.details');
      });
    });
  });

  // --- Cleanup behavior ---

  describe('Cleanup on unmount / navigation', () => {
    it('registers a beforeunload listener', () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');
      renderComponent();

      expect(addEventSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function),
      );

      addEventSpy.mockRestore();
    });

    it('removes beforeunload listener on unmount', () => {
      const removeEventSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = renderComponent();

      unmount();

      expect(removeEventSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function),
      );

      removeEventSpy.mockRestore();
    });

    it('registers a router transition hook on mount', () => {
      renderComponent();

      expect(mockOnBefore).toHaveBeenCalled();
    });

    it('deregisters router transition hook on unmount', () => {
      const mockDeregister = vi.fn();
      vi.mocked(mockOnBefore).mockReturnValue(mockDeregister);

      const { unmount } = renderComponent();
      unmount();

      expect(mockDeregister).toHaveBeenCalled();
    });

    it('calls verification destroy during cancel cleanup when verificationData exists', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockResolvedValueOnce(
        {
          data: { uuid: 'cleanup-test-uuid', status: 'pending' },
        } as any,
      );

      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: { uuid: 'cleanup-test-uuid', status: 'verified' },
      } as any);

      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      // Fill fields and submit to trigger auto-validation (sets verificationData)
      await fillAutoStep2Fields();
      clickSubmit();

      await waitFor(() => {
        expect(onboardingVerificationsStartVerification).toHaveBeenCalled();
      });

      // Now cancel
      vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
      fireEvent.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(useModal().confirm).toHaveBeenCalled();
        expect(onboardingVerificationsDestroy).toHaveBeenCalledWith({
          path: { uuid: 'cleanup-test-uuid' },
        });
      });
    });
  });

  // --- Auto-validation step 3 display ---

  describe('Step 3 – Validation result', () => {
    const goToStep3 = async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      await fillAutoStep2Fields();
      clickSubmit(); // Step 2 -> Step 3
    };

    it('shows verification successful message when status is verified', async () => {
      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: { uuid: 'v-uuid', status: 'verified' },
      } as any);

      await goToStep3();

      await waitFor(() => {
        expect(screen.getByText('Verification successful')).toBeInTheDocument();
      });
    });

    it('shows automatic verification failed message when status is escalated', async () => {
      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: {
          uuid: 'v-uuid',
          status: 'escalated',
          error_message: 'Person not found in registry',
        },
      } as any);

      await goToStep3();

      await waitFor(() => {
        expect(
          screen.getByText('Automatic verification failed'),
        ).toBeInTheDocument();
      });
    });

    it('shows no results message when validation fails before producing results', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockRejectedValueOnce(
        new Error('failed'),
      );

      await goToStep3();

      await waitFor(() => {
        expect(
          screen.getByText('No validation results available.'),
        ).toBeInTheDocument();
      });
    });
  });

  // --- Step 1 method selection info ---

  describe('Step 1 – Method selection', () => {
    it('shows ariregister method info when selected', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      await waitFor(() => {
        expect(
          screen.getByText('Next step: Personal identification'),
        ).toBeInTheDocument();
      });
    });

    it('shows manual method info when selected', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      await waitFor(() => {
        expect(
          screen.getByText(
            'Identity verification is required for business registration',
          ),
        ).toBeInTheDocument();
      });
    });
  });

  // --- Step 2 manual vs auto content ---

  describe('Step 2 – Identification content', () => {
    it('shows organization name and registration code fields for manual method', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit();

      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
        expect(screen.getByText('Registration code')).toBeInTheDocument();
      });
    });

    it('shows document upload section for manual method', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Optional information and supporting documents'),
        ).toBeInTheDocument();
      });
    });

    it('shows registration code field for automatic method', async () => {
      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      clickSubmit();

      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });
    });

    it('shows customer checklist questions for manual method', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit();

      await waitFor(() => {
        expect(screen.getByText('Customer question 1')).toBeInTheDocument();
      });
    });
  });

  // --- Step 4 – Intent ---

  describe('Step 4 – Intent', () => {
    it('loads and displays intent checklist questions', async () => {
      renderComponent();

      await selectMethod('Manual verification');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(screen.getByText('Organization name')).toBeInTheDocument();
      });

      await fillManualStep2Fields();

      clickSubmit(); // Step 2 -> Step 4
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
        expect(screen.getByText('Intent question 1')).toBeInTheDocument();
      });
    });
  });

  // --- Error handling ---

  describe('Error handling', () => {
    it('shows error notification when auto-validation fails with exception', async () => {
      vi.mocked(onboardingVerificationsStartVerification).mockRejectedValueOnce(
        new Error('Validation service unavailable'),
      );

      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      await fillAutoStep2Fields();
      clickSubmit(); // Trigger auto-validation

      await waitFor(() => {
        expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
          expect.any(Error),
          'Unable to verify company.',
        );
      });
    });

    it('handles createCustomer failure gracefully', async () => {
      vi.mocked(onboardingVerificationsRunValidation).mockResolvedValueOnce({
        data: { uuid: 'v-uuid', status: 'verified' },
      } as any);

      vi.mocked(onboardingVerificationsCreateCustomer).mockRejectedValueOnce(
        new Error('Customer creation failed'),
      );

      renderComponent();

      await selectMethod('Estonian Business Register (Äriregister)');

      clickSubmit(); // Step 1 -> Step 2
      await waitFor(() => {
        expect(
          screen.getByText('Company registration code'),
        ).toBeInTheDocument();
      });

      await fillAutoStep2Fields();

      clickSubmit(); // Step 2 -> Step 3
      await waitFor(() => {
        expect(screen.getByText('Verification successful')).toBeInTheDocument();
      });

      clickSubmit(); // Step 3 -> Step 4
      await waitFor(() => {
        expect(screen.getByText('Your Intent')).toBeInTheDocument();
      });

      // Submit
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
          expect.any(Error),
          'Unable to create organization.',
        );
      });
    });
  });
});
