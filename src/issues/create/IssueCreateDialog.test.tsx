import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  supportAttachmentsCreate,
  supportIssuesCreate,
  supportRequestTypesList,
  supportTemplatesList,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { router } from '@/router';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import {
  clearSelect,
  getSelectByLabel,
  openAndSelectOption,
} from '@/test/select';
import * as workspaceHooks from '@/workspace/hooks';

import { ISSUE_IDS } from '../types/constants';

import { constructIssuePayload, IssueCreateDialog } from './IssueCreateDialog';
import { IssueFormData } from './types';

ENV.plugins.WALDUR_SUPPORT = {
  ENABLED: true,
  DISPLAY_REQUEST_TYPE: true,
} as any;

vi.mocked(workspaceHooks.useUser).mockReturnValue({
  uuid: 'user-1',
  is_staff: true,
} as any);

const renderComponent = (props = {}) => {
  return renderWithProviders(
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
    />,
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
  const user = userEvent.setup();

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
    await user.click(nextBtn);

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
    await user.click(screen.getByTestId('next-button-step-0'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(supportIssuesCreate).toHaveBeenCalled();
    });

    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Request SUP-100 has been created.',
    );
    expect(router.stateService.go).toHaveBeenCalledWith('support.detail', {
      issue_uuid: mockIssue.uuid,
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders warning when no request types are configured', async () => {
    vi.mocked(supportRequestTypesList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText('Service desk configuration incomplete'),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('next-button-step-0')).toBeDisabled();
  });

  it('pre-fills and disables fields based on project scope', async () => {
    renderComponent({
      scopeType: 'project',
      scope: {
        name: 'Project Alpha',
        uuid: 'project-123',
        url: 'http://example.com/project-123/',
        customer_name: 'Org 1',
        customer_uuid: '123',
        customer: 'http://example.com/org/',
      },
    });

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Issue is general and not tied to any specific organization, project, or resource',
        ),
      ).toBeDisabled();
    });
  });

  it('handles standalone issue checkbox toggle correctly', async () => {
    renderComponent({ scopeType: null, scope: null });

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Issue is general and not tied to any specific organization, project, or resource',
        ),
      ).not.toBeDisabled();
    });

    const checkbox = screen.getByLabelText(
      'Issue is general and not tied to any specific organization, project, or resource',
    );
    await user.click(checkbox);

    // Organization field should get disabled
    const orgSelectContainer = getSelectByLabel('Organization');
    const orgCombobox = within(orgSelectContainer).getByRole('combobox', {
      hidden: true,
    });
    expect(orgCombobox).toBeDisabled();
  });

  // A user who belongs to no organization has nothing to pick in the
  // Organization dropdown, so the standalone toggle is their only way through
  // the wizard. It used to leave the required-field error from before the
  // toggle behind, which kept Next disabled for good.
  it('lets a standalone issue proceed without an organization', async () => {
    renderComponent({ scopeType: null, scope: null });

    const checkbox = await screen.findByLabelText(
      'Issue is general and not tied to any specific organization, project, or resource',
    );
    await waitFor(() => expect(checkbox).not.toBeDisabled());
    expect(screen.getByTestId('next-button-step-0')).toBeDisabled();

    await user.click(checkbox);

    await waitFor(() =>
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled(),
    );
  });

  it('requires an organization again once the standalone toggle is cleared', async () => {
    renderComponent({ scopeType: null, scope: null });

    const checkbox = await screen.findByLabelText(
      'Issue is general and not tied to any specific organization, project, or resource',
    );
    await waitFor(() => expect(checkbox).not.toBeDisabled());

    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled(),
    );

    await user.click(checkbox);

    await waitFor(() =>
      expect(screen.getByTestId('next-button-step-0')).toBeDisabled(),
    );
  });

  it('auto-fills and resets form on template selection and clear', async () => {
    vi.mocked(supportTemplatesList).mockResolvedValue({
      data: [
        {
          uuid: 'template-1',
          name: 'Template One',
          description: 'Description One',
          issue_type: 'INFORMATIONAL',
          attachments: [],
        },
      ],
    } as any);

    renderComponent({
      issue: {
        customer: {
          name: 'Org 1',
          uuid: '123',
          url: 'http://example.com/org/',
        },
        summary: '',
        description: '',
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled();
    });
    await user.click(screen.getByTestId('next-button-step-0'));

    // Wait for step 2 (Description) and the template dropdown
    await waitFor(() => {
      expect(screen.getByText('Template')).toBeInTheDocument();
    });

    // Select the template
    await openAndSelectOption(user, 'Template', 'Template One');

    // Title and Request description should be auto-filled
    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toHaveValue('Template One');
      expect(screen.getByLabelText('Request description')).toHaveValue(
        'Description One',
      );
    });

    // Clear the template select
    await clearSelect(user, 'Template');

    // Dropdown should show placeholder indicating it is cleared
    await waitFor(() => {
      expect(screen.getByText('Select issue template...')).toBeInTheDocument();
    });
  });

  it('submits form with attachments successfully', async () => {
    const mockRefetch = vi.fn();
    const mockIssue = {
      uuid: 'issue-100',
      key: 'SUP-100',
      url: 'http://example.com/issues/100/',
    };
    vi.mocked(supportIssuesCreate).mockResolvedValue({
      data: mockIssue,
    } as any);
    vi.mocked(supportAttachmentsCreate).mockResolvedValue({} as any);

    const mockFile = new File(['foo'], 'foo.txt', { type: 'text/plain' });

    renderComponent({
      refetch: mockRefetch,
      issue: {
        customer: {
          name: 'Org 1',
          uuid: '123',
          url: 'http://example.com/org/',
        },
        summary: 'Test summary',
        description: 'Test description',
        files: [mockFile] as any,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('next-button-step-0')).not.toBeDisabled();
    });
    await user.click(screen.getByTestId('next-button-step-0'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('confirm-button'));

    await waitFor(() => {
      expect(supportIssuesCreate).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(supportAttachmentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            issue: mockIssue.url,
            file: mockFile,
          }),
        }),
      );
    });

    expect(mockRefetch).toHaveBeenCalled();
  });
});
