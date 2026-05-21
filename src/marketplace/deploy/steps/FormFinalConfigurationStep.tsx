import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { ENV } from '@/core/config';
import { FormGroup, TextField } from '@/form';
import { translate } from '@/i18n';
import { VStepperFormStepCard } from '@/wizard';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

import { OrderStartDateField } from './OrderStartDateField';
import { ResourceNameGroup } from './ResourceNameGroup';
import { TerminationDateField } from './TerminationDateField';

export const FormFinalConfigurationStep = (props: FormStepProps) => {
  const { project } = useOrderFormData();

  const hasPrepaidComponents = useMemo(
    () => props.offering?.components?.some((c) => c.is_prepaid),
    [props.offering],
  );

  // When prepaid is active and start date is enabled, the start date
  // is embedded in the PrepaidDurationSelector instead.
  const startDateEmbeddedInPrepaid =
    hasPrepaidComponents && ENV.plugins.WALDUR_CORE.ENABLE_ORDER_START_DATE;

  return (
    <VStepperFormStepCard
      title={translate('Final configuration')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <ResourceNameGroup
        nameValidate={props.params?.nameValidate}
        nameLabel={props.params?.nameLabel}
        offering={props.offering}
        project={project}
        formatSuggestedName={props.params?.formatSuggestedName}
      />

      <Field
        name="attributes.description"
        component={FormGroup}
        maxLength={1000}
        label={translate('Description')}
      >
        <TextField />
      </Field>
      <div className="mb-7 border-bottom" />
      {!startDateEmbeddedInPrepaid && <OrderStartDateField project={project} />}
      {!hasPrepaidComponents && (
        <TerminationDateField offering={props.offering} />
      )}
    </VStepperFormStepCard>
  );
};
