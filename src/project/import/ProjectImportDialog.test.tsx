import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { noop } from 'lodash-es';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
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
  customersList,
  marketplaceOrdersCreate,
  marketplacePublicOfferingsList,
  projectsCreate,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useNotify } from '@/store/notify';
import { resetTableRegistry } from '@/table/registry';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import * as workspaceHooks from '@/workspace/hooks';

import { ProjectImportDialog } from './ProjectImportDialog';

vi.mock('@/marketplace/common/registry', () => ({
  getFormSerializer: () => (x) => x,
  getFormLimitSerializer: () => (x) => x,
  getFormLimitParser: () => (x) => x,
}));

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

const navigateToUploadStep = async (user, withResources = false) => {
  if (withResources) {
    const radioResources = screen.getByRole('radio', {
      name: /Projects with resources/i,
    });
    await user.click(radioResources);

    await waitFor(() => {
      expect(screen.getAllByText('Select offering')[0]).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('next-button-step-0'));
    await waitFor(() => {
      const offeringStep = screen.getAllByRole('listitem', {
        name: /Select offering/i,
      })[0];
      expect(offeringStep).toHaveAttribute('aria-current', 'step');
    });

    await openAndSelectOption(user, 'Select offering', 'Cloud / Test Offering');

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    await user.click(screen.getByTestId('next-button-step-1'));
  } else {
    await user.click(screen.getByTestId('next-button-step-0'));
  }

  await waitFor(() => {
    const templateStep = screen.getAllByRole('listitem', {
      name: /Download template/i,
    })[0];
    expect(templateStep).toHaveAttribute('aria-current', 'step');
  });

  await user.click(screen.getByTestId('next-button-step-1'));

  await waitFor(() => {
    const uploadStep = screen.getAllByRole('listitem', {
      name: /Upload file/i,
    })[0];
    expect(uploadStep).toHaveAttribute('aria-current', 'step');
  });
};

describe('ProjectImportDialog Component', () => {
  beforeAll(() => process.on('unhandledRejection', noop));
  afterAll(() => process.off('unhandledRejection', noop));

  beforeEach(() => {
    resetTableRegistry();
    vi.clearAllMocks();

    vi.mocked(projectsCreate).mockResolvedValue({
      data: {
        uuid: 'proj-1',
        name: 'Test Project 1',
        url: 'http://example.com/projects/proj-1/',
      },
    } as any);
    vi.mocked(marketplaceOrdersCreate).mockResolvedValue({ data: {} } as any);
    vi.mocked(customersList).mockResolvedValue(mockListResponse([]));
    vi.mocked(marketplacePublicOfferingsList).mockResolvedValue(
      mockListResponse([
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
      ]),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    const user = userEvent.setup();
    renderComponent();

    await navigateToUploadStep(user);
  });

  it('handles CSV upload and project creation workflow', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsCreate).mockResolvedValue({
      data: { uuid: 'proj-1', name: 'Test Project 1' },
    } as any);

    const mockRefetch = vi.fn();
    renderComponent({ refetch: mockRefetch });

    await navigateToUploadStep(user);

    const csvContent = `name\nTest Project 1`;
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });

    const uploaderInput = screen.getByTestId('file-uploader');
    await user.upload(uploaderInput, file);

    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    await user.click(screen.getByTestId('next-button-step-1'));

    await waitFor(() => {
      const previewStep = screen.getByRole('listitem', {
        name: /Preview & import/i,
      });
      expect(previewStep).toHaveAttribute('aria-current', 'step');
    });

    expect(
      screen.getByText('Verify your data before importing'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Test Project 1',
          customer: mockCustomer.url,
        }),
      });
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Successfully imported 1 projects',
      );
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('includes Select offering step when Projects with resources is selected', async () => {
    const user = userEvent.setup();
    renderComponent({ customer: mockCustomer });

    const radioBtn = screen.getByRole('radio', {
      name: /Projects with resources/i,
    });
    await user.click(radioBtn);

    await waitFor(() => {
      const offeringElements = screen.getAllByText('Select offering');
      expect(offeringElements.length).toBeGreaterThan(0);
    });

    await user.click(screen.getByTestId('next-button-step-0'));
    await openAndSelectOption(user, 'Select offering', 'Cloud / Test Offering');
  });

  it('handles full resource import workflow (projects_with_resources)', async () => {
    const user = userEvent.setup();
    vi.mocked(projectsCreate).mockResolvedValue({
      data: {
        uuid: 'proj-1',
        name: 'Test Project 1',
        url: 'http://example.com/projects/proj-1/',
      },
    } as any);

    renderComponent({ customer: mockCustomer });

    await navigateToUploadStep(user, true);

    const csvContent = [
      'type,name,description,oecd_fos_2007_code,is_industry,project_type,start_date,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,123,false,type,2026-01-01,2026-05-31,,,,,,',
      'resource,Test Resource 1,Sample desc,,,,,2026-05-31,Test Project 1,Test Offering,Standard Plan,4,8,us-east',
    ].join('\n');
    const file = new File([csvContent], 'resources.csv', { type: 'text/csv' });
    const uploaderInput = screen.getByTestId('file-uploader');
    await user.upload(uploaderInput, file);

    await waitFor(() => {
      expect(screen.getByText('resources.csv')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    await user.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const previewStep = screen.getAllByRole('listitem', {
        name: /Preview & import/i,
      })[0];
      expect(previewStep).toHaveAttribute('aria-current', 'step');
    });

    await waitFor(() => {
      expect(
        screen.getByText('1 Projects, 1 Resources identified'),
      ).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(projectsCreate).toHaveBeenCalled();
      expect(marketplaceOrdersCreate).toHaveBeenCalled();
      expect(useNotify().showSuccess).toHaveBeenCalledWith(
        'Successfully imported 1 projects and 1 resources',
      );
    });
  });

  it('handles CSV upload validation errors', async () => {
    const user = userEvent.setup();
    renderComponent({ customer: null });

    await navigateToUploadStep(user);

    const uploaderInput = screen.getByTestId('file-uploader');

    const invalidCsv = `invalid_col\nvalue`;
    const invalidFile = new File([invalidCsv], 'invalid.csv', {
      type: 'text/csv',
    });
    await user.upload(uploaderInput, invalidFile);

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

    const emptyFile = new File([validHeader + '\n'], 'empty.csv', {
      type: 'text/csv',
    });
    await user.upload(uploaderInput, emptyFile);

    await waitFor(() => {
      expect(
        screen.getByText('The imported file is empty.'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('next-button-step-1')).toBeDisabled();
    });

    const noCustomerCsv = `${validHeader}\n,Project Without Customer,Desc,123,false,type,2026-01-01,2026-12-31`;
    const noCustFile = new File([noCustomerCsv], 'nocust.csv', {
      type: 'text/csv',
    });
    await user.upload(uploaderInput, noCustFile);

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
    const user = userEvent.setup();
    vi.mocked(projectsCreate).mockRejectedValueOnce(new Error('API Error'));

    renderComponent();

    await navigateToUploadStep(user);

    const uploaderInput = screen.getByTestId('file-uploader');

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
    await user.upload(uploaderInput, file);

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-1')).not.toBeDisabled();
    });

    await user.click(screen.getByTestId('next-button-step-1'));
    await waitFor(() => {
      const previewStep = screen.getAllByRole('listitem', {
        name: /Preview & import/i,
      })[0];
      expect(previewStep).toHaveAttribute('aria-current', 'step');
    });

    await waitFor(() => {
      expect(screen.getByText('Test Project Error')).toBeInTheDocument();
    });

    const confirmBtn = screen.getByTestId('confirm-button');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
        expect.any(Error),
        'Unable to import projects',
      );
    });
  });

  it('clears selected file and offering when switching import type in Step 1', async () => {
    const user = userEvent.setup();
    renderComponent({ customer: mockCustomer });

    await navigateToUploadStep(user, true);

    const uploaderInput = screen.getByTestId('file-uploader');

    const csvContent = [
      'type,name,description,end_date,project_name,offering_name,plan_name,cpu_limit,ram_limit,region',
      'project,Test Project 1,Sample desc,2026-05-31,,,,,,',
    ].join('\n');
    const file = new File([csvContent], 'test_resources.csv', {
      type: 'text/csv',
    });
    await user.upload(uploaderInput, file);

    await waitFor(() => {
      expect(screen.getByText('test_resources.csv')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Back/i }));
    await waitFor(() => {
      const templateStep = screen.getAllByRole('listitem', {
        name: /Download template/i,
      })[0];
      expect(templateStep).toHaveAttribute('aria-current', 'step');
    });

    await user.click(screen.getByRole('button', { name: /Back/i }));
    await waitFor(() => {
      const offeringStep = screen.getAllByRole('listitem', {
        name: /Select offering/i,
      })[0];
      expect(offeringStep).toHaveAttribute('aria-current', 'step');
    });

    await user.click(screen.getByRole('button', { name: /Back/i }));
    await waitFor(() => {
      const importTypeStep = screen.getAllByRole('listitem', {
        name: /Import type/i,
      })[0];
      expect(importTypeStep).toHaveAttribute('aria-current', 'step');
    });

    const radioProjects = screen.getByRole('radio', { name: /Projects only/i });
    await user.click(radioProjects);

    await navigateToUploadStep(user);

    expect(screen.queryByText('test_resources.csv')).not.toBeInTheDocument();
  });
});
