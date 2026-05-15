import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  maintenanceAnnouncementsTemplateCreate,
  maintenanceAnnouncementsTemplateList,
  maintenanceAnnouncementsTemplateUpdate,
  maintenanceAnnouncementTemplateOfferingsCreate,
  maintenanceAnnouncementTemplateOfferingsList,
  maintenanceAnnouncementTemplateOfferingsPartialUpdate,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { MaintenanceSaveAsTemplateDialog } from './MaintenanceSaveAsTemplateDialog';

vi.mock('waldur-js-client');
vi.mock('@/modal/actions');
vi.mock('@/store/notify');
vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

// Mock leaf fields while keeping FormContainerFinal real
vi.mock('@/form', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    SelectField: ({ input, options, label, onChange }: any) => (
      <div>
        <label htmlFor={input.name}>{label}</label>
        <select
          id={input.name}
          data-testid={input.name}
          value={input.value?.uuid || ''}
          onChange={(e) => {
            const option = options?.find((o) => o.uuid === e.target.value);
            input.onChange(option || null);
            if (onChange) onChange(option || null);
          }}
        >
          <option value="">Select...</option>
          {options?.map((o) => (
            <option key={o.uuid} value={o.uuid}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    ),
    StringField: ({ input, label }: any) => (
      <div>
        <label htmlFor={input.name}>{label}</label>
        <input id={input.name} data-testid={input.name} {...input} />
      </div>
    ),
    SubmitButton: ({ label, disabled, children }: any) => (
      <button type="submit" disabled={disabled}>
        {label}
        {children}
      </button>
    ),
  };
});

// Mock Tip to avoid issues with Tooltip
vi.mock('@/core/Tooltip', () => ({
  Tip: ({ children }: any) => <span>{children}</span>,
}));

// Mock ActionButton and ModalDialog
vi.mock('@/modal/ModalDialog', () => ({
  ModalDialog: ({ title, children }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@/table/ActionButton', () => ({
  ActionButton: ({ title, action }: any) => (
    <button type="button" onClick={action}>
      {title}
    </button>
  ),
}));

const mockResolve = {
  formComponent: (() => null) as FC<any>,
  data: {
    maintenance_type: 'Unscheduled',
    message: 'Test message',
    offerings: [
      {
        uuid: 'offering-1',
        url: '/api/offerings/offering-1/',
        name: 'Offering 1',
      },
    ],
    impact_description: { 'offering-1': 'High impact' },
    impact_level: { 'offering-1': 'Very High' },
  },
  provider: {
    uuid: 'provider-uuid',
    url: '/api/service-providers/provider-uuid/',
  },
  onSave: vi.fn(),
  refetch: vi.fn(),
};

const renderDialog = (initialValues = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MaintenanceSaveAsTemplateDialog
        resolve={mockResolve as any}
        initialValues={initialValues}
      />
    </QueryClientProvider>,
  );
};

describe('MaintenanceSaveAsTemplateDialog', () => {
  const mockTemplates = [
    { uuid: 'template-1', name: 'Template 1', url: 'template-1-url' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: vi.fn(),
      showErrorResponse: vi.fn(),
    } as any);
    vi.mocked(useModal).mockReturnValue({
      openDialog: vi.fn(),
    } as any);

    vi.mocked(maintenanceAnnouncementsTemplateList).mockResolvedValue({
      data: mockTemplates,
      headers: { 'x-result-count': '1' },
    } as any);
    vi.mocked(maintenanceAnnouncementTemplateOfferingsList).mockResolvedValue({
      data: [],
      headers: { 'x-result-count': '0' },
    } as any);
  });

  it('renders correctly in create mode', async () => {
    renderDialog();
    expect(
      await screen.findByText('Create a maintenance template'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('submits a new template correctly', async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .mocked(maintenanceAnnouncementsTemplateCreate)
      .mockResolvedValue({
        data: { uuid: 'new-template-uuid', url: 'new-template-url' },
      } as any);
    const offeringCreateSpy = vi
      .mocked(maintenanceAnnouncementTemplateOfferingsCreate)
      .mockResolvedValue({} as any);

    renderDialog();

    await user.type(await screen.findByTestId('name'), 'New Template');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'New Template',
            service_provider: '/api/service-providers/provider-uuid/',
          }),
        }),
      );
      expect(offeringCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            maintenance_template: 'new-template-url',
            offering: '/api/offerings/offering-1/',
            impact_description: 'High impact',
            impact_level: 'Very High',
          }),
        }),
      );
      expect(mockResolve.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'new-template-uuid' }),
      );
    });
  });

  it('updates an existing template and its offerings correctly', async () => {
    const user = userEvent.setup();
    const existingOfferings = [
      {
        uuid: 'offering-1-template-rel',
        url: '/api/maintenance-template-offerings/offering-1-template-rel/',
        offering: '/api/offerings/offering-1/',
        offering_name: 'Offering 1',
        impact_description: 'Old impact',
        impact_level: 'Low',
      },
    ];
    vi.mocked(maintenanceAnnouncementTemplateOfferingsList).mockResolvedValue({
      data: existingOfferings,
      headers: { 'x-result-count': '1' },
    } as any);

    const updateSpy = vi
      .mocked(maintenanceAnnouncementsTemplateUpdate)
      .mockResolvedValue({
        data: { ...mockTemplates[0], name: 'Updated Template' },
      } as any);
    const offeringUpdateSpy = vi
      .mocked(maintenanceAnnouncementTemplateOfferingsPartialUpdate)
      .mockResolvedValue({} as any);

    renderDialog();

    // Wait for template options to load
    await waitFor(() => {
      expect(screen.getByText('Template 1')).toBeInTheDocument();
    });

    // Select existing template
    await user.selectOptions(screen.getByTestId('template'), 'template-1');

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveValue('Template 1');
    });

    await user.clear(screen.getByTestId('name'));
    await user.type(screen.getByTestId('name'), 'Updated Template');
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'template-1' },
          body: expect.objectContaining({
            name: 'Updated Template',
          }),
        }),
      );
      expect(offeringUpdateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'offering-1-template-rel' },
          body: expect.objectContaining({
            impact_description: 'High impact',
            impact_level: 'Very High',
          }),
        }),
      );
      expect(mockResolve.onSave).toHaveBeenCalled();
    });
  });

  it('calls backToMainForm on Back button click', async () => {
    const user = userEvent.setup();
    const { openDialog } = useModal();
    renderDialog();

    await user.click(await screen.findByText('Back'));

    expect(openDialog).toHaveBeenCalled();
  });
});
