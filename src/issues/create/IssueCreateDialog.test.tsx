import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  supportIssuesCreate,
  supportRequestTypesList,
  supportTemplatesList,
} from 'waldur-js-client';

import { router } from '@/router';
import { useNotify } from '@/store/notify';

import { ISSUE_IDS } from '../types/constants';

import { constructIssuePayload, IssueCreateDialog } from './IssueCreateDialog';
import { IssueFormData } from './types';

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('waldur-js-client')>();
  return {
    ...actual,
    supportIssuesCreate: vi.fn(),
    supportAttachmentsCreate: vi.fn(),
    supportRequestTypesList: vi.fn(),
    supportTemplatesList: vi.fn(),
  };
});

vi.mock('@/i18n', () => ({
  translate: (key: string, values?: any) => {
    if (key === 'Request {requestId} has been created.' && values) {
      return `Request ${values.requestId} has been created.`;
    }
    return key;
  },
  formatJsx: (key: string) => key,
  formatJsxTemplate: (key: string) => key,
}));

vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
}));

vi.mock('@/router', () => ({
  router: {
    stateService: {
      go: vi.fn(),
    },
  },
}));

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {},
      WALDUR_SUPPORT: {
        ENABLED: true,
        DISPLAY_REQUEST_TYPE: true,
      },
    },
  },
}));

const mockStore = configureStore()({
  workspace: {
    user: {
      uuid: 'user-1',
      is_staff: true,
    },
  },
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = (props = {}) => {
  const queryClient = createTestQueryClient();
  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <IssueCreateDialog
          resolve={{
            refetch: vi.fn(),
            scope: {
              name: 'Org 1',
              uuid: '123',
              url: 'http://example.com/org/',
            },
            scopeType: 'customer',
            ...props,
          }}
        />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('constructIssuePayload', () => {
  it('correctly constructs payload with default type', () => {
    const formData = {
      summary: 'Test summary',
      description: 'Test desc',
    } as unknown as IssueFormData;
    const payload = constructIssuePayload(formData);
    expect(payload).toEqual({
      type: ISSUE_IDS.INFORMATIONAL,
      summary: 'Test summary',
      description: 'Test desc',
      is_reported_manually: true,
      template: undefined,
    });
  });

  it('handles string type and object type correctly', () => {
    const stringTypeData = {
      summary: 'Summary A',
      description: 'Desc A',
      type: 'Incident',
    } as unknown as IssueFormData;
    expect(constructIssuePayload(stringTypeData).type).toBe('Incident');

    const objTypeData = {
      summary: 'Summary B',
      description: 'Desc B',
      type: { id: 'Service Request', label: 'Service Request' } as any,
    } as unknown as IssueFormData;
    expect(constructIssuePayload(objTypeData).type).toBe('Service Request');
  });

  it('correctly prioritizes resource, project, and customer hierarchy', () => {
    const customer = { url: 'http://example.com/customers/1/' } as any;
    const project = { url: 'http://example.com/projects/1/' } as any;
    const resource = { url: 'http://example.com/resources/1/' } as any;

    const withCustomer = constructIssuePayload({
      summary: 'S',
      description: 'D',
      customer,
    } as unknown as IssueFormData);
    expect(withCustomer.customer).toBe(customer.url);

    const withProject = constructIssuePayload({
      summary: 'S',
      description: 'D',
      customer,
      project,
    } as unknown as IssueFormData);
    expect(withProject.project).toBe(project.url);
    expect(withProject.customer).toBeUndefined();

    const withResource = constructIssuePayload({
      summary: 'S',
      description: 'D',
      customer,
      project,
      resource,
    } as unknown as IssueFormData);
    expect(withResource.resource).toBe(resource.url);
    expect(withResource.project).toBeUndefined();
    expect(withResource.customer).toBeUndefined();
  });
});

describe('IssueCreateDialog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supportRequestTypesList).mockResolvedValue({
      data: [
        { name: 'Informational', description: 'Info type', issue_type_id: 1 },
      ],
    } as any);
    vi.mocked(supportTemplatesList).mockResolvedValue({ data: [] } as any);
  });

  it('renders initial Step 1 details correctly', async () => {
    renderComponent();

    expect(screen.getByText('Create support request')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('Define issue type and context'),
      ).toBeInTheDocument();
    });
  });

  it('allows transitioning between wizard steps', async () => {
    renderComponent({
      issue: {
        customer: {
          name: 'Org 1',
          uuid: '123',
          url: 'http://example.com/org/',
        },
        summary: 'Test issue summary',
        description: 'Test issue description',
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled();
    });

    const nextBtn = screen.getByTestId('next-button-step-0');
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Add title, description, and attachments'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });
  });

  it('submits form and navigates on success', async () => {
    const mockRefetch = vi.fn();
    const mockIssue = {
      uuid: 'issue-100',
      key: 'SUP-100',
      url: 'http://example.com/issues/100/',
    };
    vi.mocked(supportIssuesCreate).mockResolvedValue({
      data: mockIssue,
    } as any);
    const mockShowSuccess = vi.fn();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: vi.fn(),
    } as any);

    renderComponent({
      refetch: mockRefetch,
      issue: {
        customer: {
          name: 'Org 1',
          uuid: '123',
          url: 'http://example.com/org/',
        },
        summary: 'Test issue summary',
        description: 'Test issue description',
      },
    });

    // Transition to Step 2 to hit Create
    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByTestId('next-button-step-0'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(supportIssuesCreate).toHaveBeenCalled();
    });

    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Request SUP-100 has been created.',
    );
    expect(router.stateService.go).toHaveBeenCalledWith('support.detail', {
      issue_uuid: mockIssue.uuid,
    });
    expect(mockRefetch).toHaveBeenCalled();
  });
});
