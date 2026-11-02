import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { getUUID } from '@/core/utils';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { propVal } from '@/property/propertyFields';

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
      iconNode={<WarningCircleIcon weight="bold" />}
      iconColor="warning"
    >
      <PropertyList variant="summary" termWidth="md">
        <PropertyItem
          label={translate('Service provider')}
          value={maintenance.service_provider_name}
        />
        <PropertyItem
          label={translate('Ongoing since')}
          value={propVal.date(maintenance.scheduled_start, {
            precision: 'long',
          })}
        />
        <PropertyItem
          label={translate('Expected completion')}
          value={propVal.date(maintenance.scheduled_end, { precision: 'long' })}
        />
        <PropertyItem
          label={translate('Message')}
          value={maintenance.message}
        />
        <InternalNotes maintenance={maintenance} />
      </PropertyList>
      <div className="mt-4">
        <h6 className="text-secondary font-medium mb-2">
          {translate('Affected offerings')}
        </h6>
        <AffectedOfferingsTable values={affectedOfferingsProps} />
      </div>
    </ModalDialog>
  );
};
