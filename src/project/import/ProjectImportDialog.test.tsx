import {
  act,
  cleanup,
  fireEvent,
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
import {
  customersList,
  marketplaceOrdersCreate,
  marketplacePublicOfferingsList,
  projectsCreate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { resetTableRegistry } from '@/table/registry';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { ProjectImportDialog } from './ProjectImportDialog';

ENV.pageSize = 10;

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
          },
        ],
        hasMore: false,
        additional: { page: 2 },
      }),
    ),
  };
});

const mockCustomer = {
  uuid: 'customer-123',
  name: 'Test Customer',
  url: 'http://example.com/customers/customer-123/',
} as any;

const renderComponent = (props = {}) => {
  vi.mocked(workspaceHooks.useUser).mockReturnValue({
    uuid: 'user-1',
    is_staff: true,
  } as any);

  return renderWithProviders(
    <DrawerProvider>
      <Provider store={configureStore()()}>
        <ProjectImportDialog
          resolve={{
            customer: mockCustomer,
            refetch: vi.fn(),
            ...props,
          }}
        />
      </Provider>
    </DrawerProvider>,
  );
};

describe('ProjectImportDialog Component', () => {
  beforeAll(() => process.on('unhandledRejection', noop));
  afterAll(() => process.off('unhandledRejection', noop));

  beforeEach(() => {
    cleanup();
    resetTableRegistry();
    vi.clearAllMocks();

    const mockResponse = (data: any, count = 0) => ({
      data,
      response: {
        headers: {
          get: (name: string) =>
            name.toLowerCase() === 'x-result-count' ? count.toString() : null,
        },
      },
    });

    vi.mocked(projectsCreate).mockImplementation(() =>
      Promise.resolve({
        data: {
          uuid: 'proj-1',
          name: 'Test Project 1',
          url: 'http://example.com/projects/proj-1/',
        },
      } as any),
    );
    vi.mocked(marketplaceOrdersCreate).mockResolvedValue({ data: {} } as any);
    vi.mocked(customersList).mockResolvedValue(mockResponse([], 0) as any);
    vi.mocked(marketplacePublicOfferingsList).mockImplementation(() =>
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
        ) as any,
      ),
    );
  });

  it('renders initial step with Projects only selected by default', () => {
    renderComponent();

    expect(
      screen.getByText(translate('Bulk import of projects')),
    ).toBeInTheDocument();
    expect(screen.getByText(translate('Projects only'))).toBeInTheDocument();
    expect(
      screen.getByText(translate('Projects with resources')),
    ).toBeInTheDocument();

    const nextBtn = screen.getByTestId('next-button-step-0');
    expect(nextBtn).toBeInTheDocument();
  });

  it('navigates through steps skipping Select offering when Projects only is selected', async () => {
    renderComponent();

    const nextBtn = screen.getByTestId('next-button-step-0');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      const templateStep = screen
        .getByText(translate('Download template'))
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    const nextBtnStep1 = screen.getByTestId('next-button-step-1');
    fireEvent.click(nextBtnStep1);

    await waitFor(() => {
      const uploadStep = screen
        .getByText(translate('Upload file'))
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

    fireEvent.click(screen.getByTestId('next-button-step-0'));

    await waitFor(() => {
      const templateStep = screen
        .getByText(translate('Download template'))
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));

    await waitFor(() => {
      const uploadStep = screen
        .getByText(translate('Upload file'))
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const csvContent = `name\nTest Project 1`;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(uploaderInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));

    await waitFor(() => {
      const previewStep = screen
        .getByText(translate('Preview & import'))
        .closest('.stepper-item');
      expect(previewStep).toHaveClass('current');
    });

    expect(
      screen.getByText(translate('Verify your data before importing')),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Test Project 1',
          customer: mockCustomer.url,
        }),
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        translate('Successfully imported {n} projects', { n: 1 }),
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('includes Select offering step when Projects with resources is selected', async () => {
    renderComponent({ customer: mockCustomer });

    const radioBtn = screen
      .getByText(translate('Projects with resources'))
      .closest('.form-check-box');
    fireEvent.click(radioBtn!);

    await waitFor(() => {
      const offeringElements = screen.getAllByText(
        translate('Select offering'),
      );
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

    const radioResources = screen
      .getByText(translate('Projects with resources'))
      .closest('.form-check-box');
    fireEvent.click(radioResources!);

    await waitFor(() => {
      expect(
        screen.getAllByText(translate('Select offering'))[0],
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText(translate('Select offering'))[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

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

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText(translate('Upload file'))[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const csvContent = [
      'type,name,description,oecd_fos_2007_code,is_industry,project_type,start_date,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,123,false,type,2026-01-01,2026-05-31,,,,,,',
      'resource,Test Resource 1,Sample desc,,,,,2026-05-31,Test Project 1,Test Offering,Standard Plan,4,8,us-east',
    ].join('\n');
    const file = new File([csvContent], 'resources.csv', { type: 'text/csv' });
    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(uploaderInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('resources.csv')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const previewStep = screen
        .getAllByText(translate('Preview & import'))[0]
        .closest('.stepper-item');
      expect(previewStep).toHaveClass('current');
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          translate('{n} Projects, {m} Resources identified', { n: 1, m: 1 }),
        ),
      ).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalled();
      expect(marketplaceOrdersCreate).toHaveBeenCalled();
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        translate('Successfully imported {n} projects and {m} resources', {
          n: 1,
          m: 1,
        }),
      );
    });
  });

  it('handles CSV upload validation errors', async () => {
    const { container } = renderComponent({ customer: null });

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText(translate('Upload file'))[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const invalidCsv = `invalid_col\nvalue`;
    const invalidFile = new File([invalidCsv], 'invalid.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput!, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          translate(
            'The imported data format does not match the template format.',
          ),
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

    const emptyFile = new File([validHeader + '\n'], 'empty.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput!, { target: { files: [emptyFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(translate('The imported file is empty.')),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });

    const noCustomerCsv = `${validHeader}\n,Project Without Customer,Desc,123,false,type,2026-01-01,2026-12-31`;
    const noCustFile = new File([noCustomerCsv], 'nocust.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput!, { target: { files: [noCustFile] } });

    await waitFor(() => {
      expect(
        screen.getByText(
          translate(
            'The organization UUID is not specified in one or more records.',
          ),
        ),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });
  });

  it('handles API error on submission', async () => {
    vi.mocked(projectsCreate).mockRejectedValueOnce(new Error('API Error'));

    const { container } = renderComponent();

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText(translate('Upload file'))[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

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
    fireEvent.change(uploaderInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const previewStep = screen
        .getAllByText(translate('Preview & import'))[0]
        .closest('.stepper-item');
      expect(previewStep).toHaveClass('current');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Project Error')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    fireEvent.click(confirmBtn);
    fireEvent.submit(screen.getByTestId('project-import-dialog'));

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        translate('Unable to import projects'),
      );
    });
    await act(async () => {});
  });

  it('clears selected file and offering when switching import type in Step 1', async () => {
    const { container } = renderComponent({ customer: mockCustomer });

    const radioResources = screen
      .getByText(translate('Projects with resources'))
      .closest('.form-check-box');
    fireEvent.click(radioResources!);

    await waitFor(() => {
      expect(
        screen.getAllByText(translate('Select offering'))[0],
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText(translate('Select offering'))[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

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

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText(translate('Upload file'))[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    const uploaderInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const csvContent = [
      'type,name,description,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,2026-05-31,,,,,,',
    ].join('\n');
    const file = new File([csvContent], 'test_resources.csv', {
      type: 'text/csv',
    });
    fireEvent.change(uploaderInput!, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test_resources.csv')).toBeInTheDocument();
    });

    const backBtn = screen.getByText(translate('Back'));
    fireEvent.click(backBtn);
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByText(translate('Back')));
    await waitFor(() => {
      const offeringStep = screen
        .getAllByText(translate('Select offering'))[0]
        .closest('.stepper-item');
      expect(offeringStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByText(translate('Back')));
    await waitFor(() => {
      const importTypeStep = screen
        .getAllByText(translate('Import type'))[0]
        .closest('.stepper-item');
      expect(importTypeStep).toHaveClass('current');
    });

    const radioProjects = screen
      .getByText(translate('Projects only'))
      .closest('.form-check-box');
    fireEvent.click(radioProjects!);

    fireEvent.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const templateStep = screen
        .getAllByText(translate('Download template'))[0]
        .closest('.stepper-item');
      expect(templateStep).toHaveClass('current');
    });

    fireEvent.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const uploadStep = screen
        .getAllByText(translate('Upload file'))[0]
        .closest('.stepper-item');
      expect(uploadStep).toHaveClass('current');
    });

    expect(screen.queryByText('test_resources.csv')).not.toBeInTheDocument();
  });
});
