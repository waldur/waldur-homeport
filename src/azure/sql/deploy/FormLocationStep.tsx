import { loadLocationOptions } from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';

export const FormLocationStep = (props: FormStepProps) => (
  <VStepperFormStepCard
    title={translate('Location')}
    id={props.id}
    disabled={props.disabled}
    disabledTooltip={props.disabledTooltip}
  >
    <AsyncSelectField
      name="attributes.location"
      label={translate('Location')}
      required={true}
      loadOptions={(query, prevOptions, currentPage) =>
        loadLocationOptions(
          props.offering.scope_uuid,
          query,
          prevOptions,
          currentPage,
        )
      }
      validate={required}
    />
  </VStepperFormStepCard>
);
