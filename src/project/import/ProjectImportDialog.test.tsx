import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash-es';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { marketplaceOrdersCreate, projectsCreate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { resetTableRegistry } from '@/table/registry';

import { ProjectImportDialog } from './ProjectImportDialog';

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('waldur-js-client')>();
  const mockResponse = (data: any, count = 0) => ({
    data,
    response: {
      headers: {
        get: (name: string) =>
          name.toLowerCase() === 'x-result-count' ? count.toString() : null,
      },
    },
  });
  return {
    ...actual,
    projectsCreate: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: {
          uuid: 'proj-1',
          name: 'Test Project 1',
          url: 'http://example.com/projects/proj-1/',
        },
      }),
    ),
    marketplaceOrdersCreate: vi.fn().mockResolvedValue({ data: {} }),
    customersList: vi.fn().mockResolvedValue(mockResponse([], 0)),
    marketplacePublicOfferingsList: vi.fn().mockImplementation(() =>
      Promise.resolve(
        mockResponse(
          [
            {
              uuid: 'offering-1',
              name: 'Test Offering',
              category_title: 'Cloud',
              url: 'http://example.com/offerings/offering-1/',
              type: 'Marketplace.Basic',
              components: [
                { type: 'cpu', billing_type: 'limit' },
                { type: 'ram', billing_type: 'limit' },
              ],
              plans: [
                {
                  name: 'Standard Plan',
                  url: 'http://example.com/plans/plan-1/',
                  quotas: {},
                },
              ],
              attributes: { region: 'us-east' },
              options: { order: [], options: {} },
            },
          ],
          1,
        ),
      ),
    ),
  };
});

vi.mock('@/i18n', () => ({
  translate: (key: string, values?: any) => {
    if (key === 'Successfully imported {n} projects' && values) {
      return `Successfully imported ${values.n} projects`;
    }
    if (
      key === 'Successfully imported {n} projects and {m} resources' &&
      values
    ) {
      return `Successfully imported ${values.n} projects and ${values.m} resources`;
    }
    return key;
  },
  formatJsx: (key: string) => key,
  formatJsxTemplate: (key: string) => key,
}));

vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

vi.mock('@/core/config', () => ({
  ENV: {
    pageSize: 10,
    plugins: {
      WALDUR_CORE: {},
    },
  },
}));

vi.mock('@/marketplace/common/registry', () => ({
  getFormSerializer: () => (x) => x,
  getFormLimitSerializer: () => (x) => x,
  getFormLimitParser: () => (x) => x,
}));

vi.mock('@/marketplace/common/autocompletes', () => {
  return {
    OfferingsAutocompleteCommonFields: [
      'name',
      'uuid',
      'url',
      'category_title',
      'thumbnail',
      'customer_name',
      'customer_uuid',
    ],
    publicOfferingsAutocomplete: vi.fn().mockReturnValue(() =>
      Promise.resolve({
        options: [
          {
            uuid: 'offering-1',
            name: 'Test Offering',
            category_title: 'Cloud',
            url: 'http://example.com/offerings/offering-1/',
            type: 'Marketplace.Basic',
            components: [
              { type: 'cpu', billing_type: 'limit' },
              { type: 'ram', billing_type: 'limit' },
            ],
            plans: [
              {
                name: 'Standard Plan',
                url: 'http://example.com/plans/plan-1/',
                quotas: {},
              },
            ],
            attributes: { region: 'us-east' },
            // NOTE: `options` field is intentionally omitted here because
            // react-select v5 treats any item with an `options` property
            // as a group header and calls `.map()` on it.
          },
        ],
        hasMore: false,
        additional: { page: 2 },
      }),
    ),
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockCustomer = {
  uuid: 'customer-123',
  name: 'Test Customer',
  url: 'http://example.com/customers/customer-123/',
} as any;

const renderComponent = (props = {}) => {
  const queryClient = createTestQueryClient();
  const store = configureStore()({
    workspace: {
      user: {
        uuid: 'user-1',
        is_staff: true,
      },
    },
    title: {
      title: 'Test Title',
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ProjectImportDialog
          resolve={{
            customer: mockCustomer,
            refetch: vi.fn(),
            ...props,
          }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
const mockShowErrorResponse = vi.fn();

describe('ProjectImportDialog Component', () => {
  // Suppress unhandled rejections from react-final-form's handleSubmit:
  // When `mutateAsync` rejects (e.g., API Error test), the rejection propagates
  // through the form handler as an unhandled promise rejection in JSDOM.
  beforeAll(() => process.on('unhandledRejection', noop));
  afterAll(() => process.off('unhandledRejection', noop));

  beforeEach(() => {
    cleanup();
    resetTableRegistry();
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showErrorResponse: mockShowErrorResponse,
    } as any);
  });

  it('renders initial step with Projects only selected by default', () => {
    renderComponent();

    expect(screen.getByText('Bulk import of projects')).toBeInTheDocument();
    expect(screen.getByText('Projects only')).toBeInTheDocument();
    expect(screen.getByText('Projects with resources')).toBeInTheDocument();

    const nextBtn = screen.getByTestId('next-button-step-0');
    expect(nextBtn).toBeInTheDocument();
  });

  it('navigates through steps skipping Select offering when Projects only is selected', async () => {
    renderComponent();

    // Step 0: Import type (Projects only selected by default)
    const nextBtn = screen.getByTestId('next-button-step-0');
    fireEvent.click(nextBtn);

    // Step 1: Download template
    await waitFor(() => {
      const templateStep = screen
        .getByText('Download template')
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    const nextBtnStep1 = screen.getByTestId('next-button-step-1');
    fireEvent.click(nextBtnStep1);

    // Step 2: Upload file
    await waitFor(() => {
      const uploadStep = screen
        .getByText('Upload file')
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });
  });

  it('handles CSV upload and project creation workflow', async () => {
    vi.mocked(projectsCreate).mockResolvedValue({
      data: { uuid: 'proj-1', name: 'Test Project 1' },
    } as any);

    const mockRefetch = vi.fn();
    const { container } = renderComponent({ refetch: mockRefetch });

    // Step 0 -> Download template
    fireEvent.click(screen.getByTestId('next-button-step-0'));

    await waitFor(() => {
      const templateStep = screen
        .getByText('Download template')
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    // Download template -> Upload file
    fireEvent.click(screen.getByTestId('next-button-step-1'));

    await waitFor(() => {
      const uploadStep = screen
        .getByText('Upload file')
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    // Mock CSV file upload matching all template header fields exactly
    const csvContent = `name\nTest Project 1`;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(uploaderInput).toBeInTheDocument();
    fireEvent.change(uploaderInput, { target: { files: [file] } });

    await waitFor(
      () => {
        expect(screen.getByText('test.csv')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
      },
      { timeout: 3000 },
    );

    // Upload file -> Preview & import
    fireEvent.click(screen.getByTestId('next-button-step-1'));

    await waitFor(
      () => {
        const previewStep = screen
          .getByText('Preview & import')
          .closest('.stepper-item');
        expect(previewStep).toHaveClass('current');
      },
      { timeout: 3000 },
    );

    expect(
      screen.getByText('Verify your data before importing'),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const confirmBtn = screen.getByTestId(
      'confirm-button',
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    // Click Confirm and trigger submit directly on form
    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(
      () => {
        expect(projectsCreate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            name: 'Test Project 1',
            customer: mockCustomer.url,
          }),
        });
        expect(mockShowSuccess).toHaveBeenCalledWith(
          'Successfully imported 1 projects',
        );
        expect(mockRefetch).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });

  it('includes Select offering step when Projects with resources is selected', async () => {
    renderComponent({ customer: mockCustomer });

    // Select "Projects with resources"
    const radioBtn = screen
      .getByText('Projects with resources')
      .closest('.form-check-box');
    expect(radioBtn).toBeInTheDocument();
    fireEvent.click(radioBtn!);

    // Wait for the stepper list to update and include "Select offering" step
    await waitFor(() => {
      const offeringElements = screen.getAllByText('Select offering');
      expect(offeringElements.length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    const autocompleteInput = screen.getByRole('combobox');
    await userEvent.click(autocompleteInput);
    await waitFor(() => {
      expect(screen.getByText('Cloud / Test Offering')).toBeInTheDocument();
    });
  });

  it('handles full resource import workflow (projects_with_resources)', async () => {
    vi.mocked(projectsCreate).mockResolvedValue({
      data: {
        uuid: 'proj-1',
        name: 'Test Project 1',
        url: 'http://example.com/projects/proj-1/',
      },
    } as any);

    const { container } = renderComponent({ customer: mockCustomer });

    // Step 0: Select "Projects with resources"
    const radioResources = screen
      .getByText('Projects with resources')
      .closest('.form-check-box');
    fireEvent.click(radioResources!);

    await waitFor(() => {
      expect(screen.getAllByText('Select offering')[0]).toBeInTheDocument();
    });

    // Go to Step 1: Select offering
    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText('Select offering')[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

    // Autocomplete field selection
    const autocompleteInput = screen.getByRole('combobox');
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      expect(screen.getByText('Cloud / Test Offering')).toBeInTheDocument();
    });
    const option5 = screen
      .getByText('Cloud / Test Offering')
      .closest('.metronic-select__option');
    act(() => {
      fireEvent.click(option5!);
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    // Go to Step 2: Download template
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    // Go to Step 3: Upload file
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText('Upload file')[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    // Upload CSV containing both project and resource matching template headers
    const csvContent = [
      'type,name,description,oecd_fos_2007_code,is_industry,project_type,start_date,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,123,false,type,2026-01-01,2026-05-31,,,,,,',
      'resource,Test Resource 1,Sample desc,,,,,2026-05-31,Test Project 1,Test Offering,Standard Plan,4,8,us-east',
    ].join('\n');
    const file = new File([csvContent], 'resources.csv', { type: 'text/csv' });
    const uploaderInput = await waitFor(() => {
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      return input;
    });
    fireEvent.change(uploaderInput, { target: { files: [file] } });

    await waitFor(
      () => {
        expect(screen.getByText('resources.csv')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
      },
      { timeout: 3000 },
    );

    // Go to Step 4: Preview & import
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(
      () => {
        const previewStep = screen
          .getAllByText('Preview & import')[0]
          .closest('.stepper-item');
        expect(previewStep).toHaveClass('current');
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        expect(
          screen.getByText('1 Projects, 1 Resources identified'),
        ).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const confirmBtn = screen.getByTestId(
      'confirm-button',
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    // Confirm and submit
    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(
      () => {
        expect(projectsCreate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            name: 'Test Project 1',
          }),
        });
        expect(marketplaceOrdersCreate).toHaveBeenCalledWith({
          body: expect.objectContaining({
            offering: 'http://example.com/offerings/offering-1/',
            project: 'http://example.com/projects/proj-1/',
            plan: 'http://example.com/plans/plan-1/',
          }),
        });
        expect(mockShowSuccess).toHaveBeenCalledWith(
          'Successfully imported 1 projects and 1 resources',
        );
      },
      { timeout: 3000 },
    );
  });

  it('handles CSV upload validation errors', async () => {
    // Pass customer: null to test missing org UUID validation
    const { container } = renderComponent({ customer: null });

    // Step 0 -> Step 1 (Download template)
    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    // Step 1 -> Step 2 (Upload file)
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText('Upload file')[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const uploaderInput = await waitFor(() => {
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      return input;
    });

    // 1. Header mismatch
    const invalidCsv = `invalid_col\nvalue`;
    const invalidFile = new File([invalidCsv], 'invalid.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          'The imported data format does not match the template format.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });

    const validHeader = [
      'customer_uuid',
      'name',
      'description',
      'oecd_fos_2007_code',
      'is_industry',
      'project_type',
      'start_date',
      'end_date',
    ].join(',');

    // 2. Empty file
    const emptyFile = new File([validHeader + '\n'], 'empty.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput, { target: { files: [emptyFile] } });

    await waitFor(() => {
      expect(
        screen.getByText('The imported file is empty.'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });

    // 3. Missing org UUID
    const noCustomerCsv = `${validHeader}\n,Project Without Customer,Desc,123,false,type,2026-01-01,2026-12-31`;
    const noCustFile = new File([noCustomerCsv], 'nocust.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput, { target: { files: [noCustFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          'The organization UUID is not specified in one or more records.',
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });
  });

  it('handles API error on submission', async () => {
    vi.mocked(projectsCreate).mockRejectedValueOnce(new Error('API Error'));

    const { container } = renderComponent();

    // Step 0 -> Step 1 -> Step 2
    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText('Upload file')[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const uploaderInput = await waitFor(() => {
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      return input;
    });

    const validHeader = [
      'customer_uuid',
      'name',
      'description',
      'oecd_fos_2007_code',
      'is_industry',
      'project_type',
      'start_date',
      'end_date',
    ].join(',');
    const csvContent = `${validHeader}\n,Test Project Error,Desc,123,false,type,2026-01-01,2026-12-31`;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    fireEvent.change(uploaderInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const previewStep = screen
        .getAllByText('Preview & import')[0]
        .closest('.stepper-item');
      expect(previewStep).toHaveClass('current');
    });

    await waitFor(
      () => {
        expect(screen.getByText('Test Project Error')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const confirmBtn = screen.getByTestId(
      'confirm-button',
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(false);

    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(() => {
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'Unable to import projects',
      );
    });
    // Flush remaining microtasks from the rejection handler
    await act(async () => {});
  });

  it('clears selected file and offering when switching import type in Step 1', async () => {
    const { container } = renderComponent({ customer: mockCustomer });

    // Select "Projects with resources"
    const radioResources = screen
      .getByText('Projects with resources')
      .closest('.form-check-box');
    fireEvent.click(radioResources!);

    await waitFor(() => {
      expect(screen.getAllByText('Select offering')[0]).toBeInTheDocument();
    });

    // Move to Step 1 (Select offering)
    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText('Select offering')[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

    // Select an offering
    const autocompleteInput = screen.getByRole('combobox');
    await userEvent.click(autocompleteInput);

    await waitFor(() => {
      expect(screen.getByText('Cloud / Test Offering')).toBeInTheDocument();
    });
    const option8 = screen
      .getByText('Cloud / Test Offering')
      .closest('.metronic-select__option');
    act(() => {
      fireEvent.click(option8!);
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    // Move to Step 2 (Download template)
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    // Move to Step 3 (Upload file)
    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText('Upload file')[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    // Upload a file
    const uploaderInput = await waitFor(() => {
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      return input;
    });

    const csvContent = [
      'type,name,description,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,2026-05-31,,,,,,',
    ].join('\n');
    const file = new File([csvContent], 'test_resources.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test_resources.csv')).toBeInTheDocument();
    });

    // Navigate back to Step 0 (Import type)
    const backBtn = screen.getByText('Back');
    fireEvent.click(backBtn); // Back to Step 2
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByText('Back')); // Back to Step 1
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText('Select offering')[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByText('Back')); // Back to Step 0
    await waitFor(() => {
      const importTypeStep = screen
        .getAllByText('Import type')[0]
        .closest('.stepper-item');
      expect(importTypeStep).toHaveClass('current');
    });

    // Switch to "Projects only"
    const radioProjects = screen
      .getByText('Projects only')
      .closest('.form-check-box');
    fireEvent.click(radioProjects!);

    // Now navigate forward to Upload file step (Step 0 -> Step 1 -> Step 2)
    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText('Download template')[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText('Upload file')[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    // The previously uploaded file should have been cleared
    expect(screen.queryByText('test_resources.csv')).not.toBeInTheDocument();
  });
});
