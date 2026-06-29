import { FC, useCallback } from 'react';
import { MaintenanceAnnouncement, ServiceProvider } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import {
  getMaintenanceOfferingFormFields,
  MAINTENANCE_ANNOUNCEMENT_FORM_ID,
} from '../utils';

const MaintenanceFormDialog = lazyComponent(() =>
  import('../create/MaintenanceFormDialog').then((module) => ({
    default: module.MaintenanceFormDialog,
  })),
);

interface MaintenanceEditActionProps {
  provider: ServiceProvider;
  row: MaintenanceAnnouncement;
  refetch(): void;
}

export const MaintenanceEditAction: FC<MaintenanceEditActionProps> = ({
  provider,
  row,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    const { impact_level, impact_description } =
      getMaintenanceOfferingFormFields(row.affected_offerings);

    const scheduled_window: [Date, Date] | undefined =
      row.scheduled_start && row.scheduled_end
        ? [new Date(row.scheduled_start), new Date(row.scheduled_end)]
        : undefined;

    openDialog(MaintenanceFormDialog, {
      resolve: { provider, refetch, maintenanceUuid: row.uuid },
      size: 'lg',
      formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
      initialValues: {
        name: row.name,
        message: row.message,
        maintenance_type: row.maintenance_type,
        external_reference_url: row.external_reference_url,
        internal_notes: row.internal_notes,
        scheduled_window,
        affected_offerings: row.affected_offerings,
        impact_description,
        impact_level,
      },
    });
  }, [row, provider, refetch]);

  if (row.state !== 'Draft') return null;

  return <EditAction action={callback} title={translate('Edit')} />;
};
