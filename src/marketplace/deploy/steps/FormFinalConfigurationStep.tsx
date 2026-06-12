import { useMemo } from 'react';

import { ENV } from '@/core/config';
import { DateGroup, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { VStepperFormStepCard } from '@/wizard';

import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

import { ResourceNameGroup } from './ResourceNameGroup';
import { TerminationDateField } from './TerminationDateField';
import { useOrderStartDateBounds } from './useOrderStartDateBounds';

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

  const dateFieldProps = useOrderStartDateBounds(project);

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
      <TextGroup
        name="attributes.description"
        maxLength={1000}
        label={translate('Description')}
      />
      <div className="mb-7 border-bottom" />
      {!startDateEmbeddedInPrepaid && (
        <DateGroup
          name="start_date"
          label={translate('Start date')}
          description={translate(
            'The date when the resource provisioning will be initiated. If not set, the order is processed immediately after approval.',
          )}
          {...dateFieldProps}
        />
      )}
      {!hasPrepaidComponents && (
        <TerminationDateField offering={props.offering} />
      )}
    </VStepperFormStepCard>
  );
};
