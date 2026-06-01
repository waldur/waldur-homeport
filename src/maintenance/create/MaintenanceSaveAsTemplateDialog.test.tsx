import { screen, waitFor } from '@testing-library/react';
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
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { MaintenanceSaveAsTemplateDialog } from './MaintenanceSaveAsTemplateDialog';

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
  return renderWithProviders(
    <MaintenanceSaveAsTemplateDialog
      resolve={mockResolve as any}
      initialValues={initialValues}
    />,
  );
};

describe('MaintenanceSaveAsTemplateDialog', () => {
  const mockTemplates = [
    { uuid: 'template-1', name: 'Template 1', url: 'template-1-url' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(maintenanceAnnouncementsTemplateList).mockResolvedValue(
      mockListResponse(mockTemplates),
    );
    vi.mocked(maintenanceAnnouncementTemplateOfferingsList).mockResolvedValue(
      mockListResponse([]),
    );
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

    await user.type(await screen.findByLabelText('Name'), 'New Template');
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
    vi.mocked(maintenanceAnnouncementTemplateOfferingsList).mockResolvedValue(
      mockListResponse(existingOfferings),
    );

    const updateSpy = vi
      .mocked(maintenanceAnnouncementsTemplateUpdate)
      .mockResolvedValue({
        data: { ...mockTemplates[0], name: 'Updated Template' },
      } as any);
    const offeringUpdateSpy = vi
      .mocked(maintenanceAnnouncementTemplateOfferingsPartialUpdate)
      .mockResolvedValue({} as any);

    renderDialog();

    // Select existing template
    await openAndSelectOption(user, 'Template', 'Template 1');

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Template 1');
    });

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Updated Template');
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
