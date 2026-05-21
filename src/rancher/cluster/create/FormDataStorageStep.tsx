import { PlusIcon } from '@phosphor-icons/react';
import { Fragment, useCallback } from 'react';
import { FieldArray } from 'react-final-form-arrays';

import { isFeatureVisible } from '@/features/connect';
import { RancherFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';
import { ActionButton } from '@/table/ActionButton';
import { VStepperFormStepCard } from '@/wizard';

import {
  FormNodeStorageRow,
  FormNodeStorageTable,
} from './FormNodeStorageTable';
import { useFormNodes, useFormTenant, useVolumeDataLoader } from './utils';
import { VolumeMountPointGroup } from './VolumeMountPointGroup';

import './FormDataStorageStep.scss';

const renderDataVolumeRows = ({
  fields,
  nodeIndex,
  volumeTypeChoices,
  defaultVolumeType,
  sizeLimit,
  sizeValidate,
}: any) => {
  return (
    <>
      {fields.length > 0 &&
        fields.map((volume, index) => (
          <Fragment key={index}>
            <FormNodeStorageRow
              parentName={volume}
              typeName="volume_type"
              sizeName="size"
              altRowName={'#' + (index + 1)}
              volumeTypeChoices={volumeTypeChoices}
              defaultVolumeType={defaultVolumeType}
              sizeLimit={sizeLimit}
              sizeValidate={sizeValidate}
              onDeleteRow={() => fields.remove(index)}
            />

            {isFeatureVisible(RancherFeatures.volume_mount_point) && (
              <tr>
                <td>
                  <VolumeMountPointGroup nodeIndex={nodeIndex} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      <tr>
        <td colSpan={4}>
          <ActionButton
            variant="tertiary"
            className="text-nowrap"
            action={() =>
              fields.push({ size: 1, volume_type: defaultVolumeType })
            }
            iconNode={<PlusIcon weight="bold" />}
            title={translate('Add data volume')}
          />
        </td>
      </tr>
    </>
  );
};

export const FormDataStorageStep = (props: FormStepProps) => {
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
      title={translate('Data storage')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      className="step-data-storage"
    >
      {nodes?.length ? (
        nodes.map((node, i) => (
          <FormNodeStorageTable
            key={i}
            volumeTypeChoices={data?.volumeTypeChoices}
            title={node.name}
          >
            <FieldArray
              name={`attributes.nodes[${i}].data_volumes`}
              component={renderDataVolumeRows}
              volumeTypeChoices={data?.volumeTypeChoices}
              defaultVolumeType={data?.defaultVolumeType}
              sizeLimit={limit}
              sizeValidate={[exceeds]}
              nodeIndex={i}
            />
          </FormNodeStorageTable>
        ))
      ) : (
        <StepCardPlaceholder>
          {translate('Please add a node')}
        </StepCardPlaceholder>
      )}
    </VStepperFormStepCard>
  );
};
