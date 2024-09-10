import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FormSection } from 'redux-form';

import { required } from '@waldur/core/validators';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { StepCardPlaceholder } from '@waldur/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import {
  FormNodeStorageRow,
  FormNodeStorageTable,
} from './FormNodeStorageTable';
import {
  formNodesSelector,
  formTenantSelector,
  useVolumeDataLoader,
} from './utils';

export const FormSystemStorageStep = (props: FormStepProps) => {
  const tenantSettings = useSelector(formTenantSelector);
  const nodes = useSelector(formNodesSelector);
  const { data, isLoading } = useVolumeDataLoader(tenantSettings);

  const limit = 10240; // GB

  const exceeds = useCallback(
    (value: number) => {
      return (value || 0) <= limit
        ? undefined
        : translate('Quota usage exceeds available limit.');
    },
    [limit],
  );

  return (
    <VStepperFormStepCard
      title={translate('System storage')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
    >
      {nodes?.length ? (
        <FormNodeStorageTable volumeTypeChoices={data?.volumeTypeChoices}>
          {nodes.map((_, i) => (
            <FormSection key={i} name={String(`attributes.nodes[${i}]`)}>
              <FormNodeStorageRow
                parentName={`attributes.nodes[${i}]`}
                typeName="system_volume_type"
                sizeName="system_volume_size"
                volumeTypeChoices={data?.volumeTypeChoices}
                defaultVolumeType={data?.defaultVolumeType}
                sizeLimit={limit}
                sizeValidate={[required, exceeds]}
                typeValidate={[required]}
                change={props.change}
              />
            </FormSection>
          ))}
        </FormNodeStorageTable>
      ) : (
        <StepCardPlaceholder>
          {translate('Please add a node')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
