import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { MaintenanceAnnouncement, ServiceProvider } from 'waldur-js-client';

import { parseDate } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';

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
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    const startDate = parseDate(row.scheduled_start);
    const endDate = parseDate(row.scheduled_end);

    const { impact_level, impact_description } =
      getMaintenanceOfferingFormFields(row.affected_offerings);

    dispatch(
      openModalDialog(MaintenanceFormDialog, {
        resolve: { provider, refetch, maintenanceUuid: row.uuid },
        size: 'lg',
        formId: MAINTENANCE_ANNOUNCEMENT_FORM_ID,
        initialValues: {
          name: row.name,
          message: row.message,
          maintenance_type: row.maintenance_type,
          external_reference_url: row.external_reference_url,
          internal_notes: row.internal_notes,
          scheduled_start_date: row.scheduled_start
            ? startDate.toISODate()
            : null,
          scheduled_start_time: row.scheduled_start
            ? startDate.toISOTime()
            : null,
          scheduled_end_date: row.scheduled_end ? endDate.toISODate() : null,
          scheduled_end_time: row.scheduled_end ? endDate.toISOTime() : null,
          affected_offerings: row.affected_offerings,
          impact_description,
          impact_level,
        },
      }),
    );
  }, [row, provider, dispatch, refetch]);

  if (row.state !== 'Draft') return null;

  return <EditAction action={callback} title={translate('Edit')} />;
};
