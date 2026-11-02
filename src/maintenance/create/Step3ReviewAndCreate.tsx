import { DateTime } from 'luxon';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { formatMediumDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { WizardModal, WizardStepProps } from '@/wizard';

import { InternalNotes } from '../InternalNotesField';
import { MAINTENANCE_TYPE, MaintenanceForm } from '../types';

import { AffectedOfferingsTable } from './AffectedOfferingsTable';
import { ImpactSummary } from './ImpactSummary';

export const Step3ReviewAndCreate: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<MaintenanceForm>();

  const [start, end] = values.scheduled_window ?? [];
  const zone = DateTime.local().zone.name;
  const provider = props.data?.provider ?? values.service_provider;

  return (
    <WizardModal {...props}>
      <PropertyList variant="summary" termWidth="md">
        <PropertyItem label={translate('Name')} value={values.name} />
        <PropertyItem
          label={translate('Type')}
          value={propVal.enum(values.maintenance_type, {
            labels: MAINTENANCE_TYPE,
          })}
        />
        <PropertyItem
          label={translate('Window')}
          value={
            start && end
              ? propVal.annotated(
                  propVal.pair(
                    formatMediumDateTime(start),
                    formatMediumDateTime(end),
                    { separator: ' → ' },
                  ),
                  { hint: zone },
                )
              : null
          }
        />
        <PropertyItem label={translate('Message')} value={values.message} />
        <PropertyItem
          label={translate('External reference')}
          value={values.external_reference_url}
        />
        <InternalNotes maintenance={values} />
      </PropertyList>
      <div className="mt-4">
        <h6 className="text-secondary font-medium mb-2">
          {translate('Impact')}
        </h6>
        <ImpactSummary
          offerings={values.offerings}
          impactLevels={values.impact_level}
          provider={provider}
          compact
        />
      </div>
      <div className="mt-4">
        <h6 className="text-secondary font-medium mb-2">
          {translate('Affected offerings')}
        </h6>
        <AffectedOfferingsTable values={values} />
      </div>
    </WizardModal>
  );
};
