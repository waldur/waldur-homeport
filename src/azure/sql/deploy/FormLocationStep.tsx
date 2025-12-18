import { loadLocationOptions } from '@waldur/azure/vm/utils';
import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

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
