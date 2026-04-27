import { useMemo } from 'react';
import { Field, formValues } from 'redux-form';

import { FieldError } from '@/form';
import { StaticField } from '@/form/StaticField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { maxAmount } from '@/marketplace/common/utils';
import { FormStepProps } from '@/marketplace/deploy/types';

import { useVMwareLimitsLoader } from './utils';

const GuestOSField = formValues<any>({
  template: 'attributes.template',
})((props) =>
  props.template ? (
    <StaticField
      label={translate('Guest OS')}
      value={props.template.guest_os_name}
    />
  ) : null,
);

const StaticDiskField = (props) => {
  const diskValidator = useMemo(() => {
    const validators = [];
    if (props.limits.max_disk) {
      validators.push(maxAmount(props.limits.max_disk));
    }
    if (props.limits.max_disk_total) {
      validators.push(maxAmount(props.limits.max_disk_total));
    }
    return validators;
  }, [props.limits.max_disk, props.limits.max_disk_total]);

  return (
    <Field
      name="limits.disk"
      validate={diskValidator}
      component={(fieldProps) =>
        fieldProps.input.value ? (
          <>
            <StaticField
              label={translate('Storage size in GiB')}
              value={fieldProps.input.value}
              labelClass="col-sm-3"
              controlClass="col-sm-9"
            />

            <FieldError error={fieldProps.meta.error} />
          </>
        ) : null
      }
    />
  );
};

export const FormStorageStep = (props: FormStepProps) => {
  const { limits, isLoading } = useVMwareLimitsLoader(
    props.offering.scope_uuid,
  );

  return (
    <VStepperFormStepCard
      title={translate('Storage')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <StaticDiskField limits={limits} />
      <GuestOSField />
    </VStepperFormStepCard>
  );
};
