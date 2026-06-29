import { DateTime } from 'luxon';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { formatMediumDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
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
      <Field label={translate('Name')} value={values.name} />
      <Field
        label={translate('Type')}
        value={MAINTENANCE_TYPE[values.maintenance_type]}
      />
      <Field
        label={translate('Window')}
        value={
          start && end
            ? translate('{start} → {end} ({zone})', {
                start: formatMediumDateTime(start),
                end: formatMediumDateTime(end),
                zone,
              })
            : '—'
        }
      />
      <Field label={translate('Message')} value={values.message} />
      {Boolean(values.external_reference_url) && (
        <Field
          label={translate('External reference')}
          value={values.external_reference_url}
        />
      )}
      <InternalNotes maintenance={values} />
      <Field label={translate('Impact')} valueCol={12} valueClass="mt-2">
        <ImpactSummary
          offerings={values.offerings}
          impactLevels={values.impact_level}
          provider={provider}
          compact
        />
      </Field>
      <Field
        label={translate('Affected offerings')}
        valueCol={12}
        valueClass="mt-2"
      >
        <AffectedOfferingsTable values={values} />
      </Field>
    </WizardModal>
  );
};
