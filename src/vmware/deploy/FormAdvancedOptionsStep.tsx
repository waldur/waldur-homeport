import { useQuery } from '@tanstack/react-query';

import { ENV } from '@waldur/configs/default';
import { FormContainer, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { loadVMwareAdvancedOptions } from '../api';

export const FormAdvancedOptionsStep = (props: FormStepProps) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;

  const { data, isLoading } = useQuery(
    ['vmware-advanced-options', props.offering.uuid],
    async () => {
      const data = await loadVMwareAdvancedOptions({
        customer_uuid: props.offering.customer_uuid,
        settings_uuid: props.offering.scope_uuid,
      });
      return data;
    },
    { staleTime: 3 * 60 * 1000 },
  );

  return (
    <StepCard
      title={translate('Advanced options')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      {data && (
        <FormContainer submitting={false} className="size-xl">
          {advancedMode && data.clusters.length > 0 && (
            <SelectField
              label={translate('Cluster')}
              name="attributes.cluster"
              options={data.clusters}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
          {advancedMode && data.datastores.length > 0 && (
            <SelectField
              label={translate('Datastore')}
              name="attributes.datastore"
              options={data.datastores}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
          {advancedMode && data.folders.length > 0 && (
            <SelectField
              label={translate('Folder')}
              name="attributes.folder"
              options={data.folders}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
        </FormContainer>
      )}
    </StepCard>
  );
};
