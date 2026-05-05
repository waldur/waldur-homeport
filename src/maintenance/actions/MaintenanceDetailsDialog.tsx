import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { Field } from '@/resource/summary';

import { AffectedOfferingsTable } from '../create/AffectedOfferingsTable';
import { InternalNotes } from '../InternalNotesField';

export const MaintenanceDetailsDialog: FC<{
  resolve: {
    maintenance: MaintenanceAnnouncement;
  };
}> = ({ resolve: { maintenance } }) => {
  const affectedOfferingsProps = useMemo(
    () => ({
      offerings: maintenance.affected_offerings.map((item) => ({
        uuid: getUUID(item.offering),
        url: item.offering,
        name: item.offering_name,
      })),
      impact_level: maintenance.affected_offerings.reduce((acc, item) => {
        acc[getUUID(item.offering)] = item.impact_level;
        return acc;
      }, {}),
      impact_description: maintenance.affected_offerings.reduce((acc, item) => {
        acc[getUUID(item.offering)] = item.impact_description;
        return acc;
      }, {}),
    }),
    [maintenance],
  );

  return (
    <ModalDialog
      title={translate('Maintenance: {name}', { name: maintenance.name })}
      className="maintenance-details"
      iconNode={<WarningCircleIcon weight="bold" />}
      iconColor="warning"
    >
      <Field
        label={translate('Service provider')}
        value={maintenance.service_provider_name}
      />
      <Field
        label={translate('Ongoing since')}
        value={formatDateTime(maintenance.scheduled_start)}
      />
      <Field
        label={translate('Expected completion')}
        value={formatDateTime(maintenance.scheduled_end)}
      />
      <Field label={translate('Message')} value={maintenance.message} />
      <InternalNotes maintenance={maintenance} />
      <Field
        label={translate('Affected offerings')}
        valueCol={12}
        valueClass="mt-2"
      >
        <AffectedOfferingsTable values={affectedOfferingsProps} />
      </Field>
    </ModalDialog>
  );
};
