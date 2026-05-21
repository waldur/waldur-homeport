import { Fragment, useCallback } from 'react';

import { required } from '@/core/validators';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';

import {
  FormNodeStorageRow,
  FormNodeStorageTable,
} from './FormNodeStorageTable';
import { useFormNodes, useFormTenant, useVolumeDataLoader } from './utils';

export const FormSystemStorageStep = (props: FormStepProps) => {
  const tenant = useFormTenant();
  const nodes = useFormNodes();
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
            <Fragment key={i}>
              <FormNodeStorageRow
                parentName={`attributes.nodes[${i}]`}
                typeName="system_volume_type"
                sizeName="system_volume_size"
                volumeTypeChoices={data?.volumeTypeChoices}
                defaultVolumeType={data?.defaultVolumeType}
                sizeLimit={limit}
                sizeValidate={[required, exceeds]}
                typeValidate={[required]}
              />
            </Fragment>
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
