import { DateTime } from 'luxon';
import { FC } from 'react';

import { formatTime } from '@waldur/core/dateUtils';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { InternalNotes } from '../InternalNotesField';
import { MAINTENANCE_TYPE, MaintenanceForm } from '../types';

import { AffectedOfferingsTable } from './AffectedOfferingsTable';

export const Step3ReviewAndCreate: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const values: MaintenanceForm = wizardProps.formValues;
        return (
          <>
            <Field label={translate('Name')} value={values.name} />
            <Field
              label={translate('Type')}
              value={MAINTENANCE_TYPE[values.maintenance_type]}
            />
            <Field
              label={translate('Start date')}
              value={translate('{date} at {time} {zone}', {
                date: values.scheduled_start_date,
                time: formatTime(values.scheduled_start_time),
                zone: DateTime.local().zone.name,
              })}
            />
            <Field
              label={translate('End date')}
              value={translate('{date} at {time} {zone}', {
                date: values.scheduled_end_date,
                time: formatTime(values.scheduled_end_time),
                zone: DateTime.local().zone.name,
              })}
            />
            <Field label={translate('Message')} value={values.message} />
            {Boolean(values.external_reference_url) && (
              <Field
                label={translate('External reference')}
                value={values.external_reference_url}
              />
            )}
            <InternalNotes maintenance={values} />
            <Field
              label={translate('Affected offerings')}
              valueCol={12}
              valueClass="mt-2"
            >
              <AffectedOfferingsTable values={values} />
            </Field>
          </>
        );
      }}
    </WizardForm>
  );
};
