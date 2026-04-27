import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FormSection } from 'redux-form';

import { required } from '@/core/validators';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';

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
  const tenant = useSelector(formTenantSelector);
  const nodes = useSelector(formNodesSelector);
  const { data, isLoading } = useVolumeDataLoader(tenant);

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
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
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
