import { PlusIcon } from '@phosphor-icons/react';
import { Fragment, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FieldArray, FormSection } from 'redux-form';

import { isFeatureVisible } from '@/features/connect';
import { RancherFeatures } from '@/FeaturesEnums';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { StepCardPlaceholder } from '@/marketplace/deploy/steps/StepCardPlaceholder';
import { FormStepProps } from '@/marketplace/deploy/types';
import { ActionButton } from '@/table/ActionButton';

import {
  FormNodeStorageRow,
  FormNodeStorageTable,
} from './FormNodeStorageTable';
import {
  formNodesSelector,
  formTenantSelector,
  useVolumeDataLoader,
} from './utils';
import { VolumeMountPointGroup } from './VolumeMountPointGroup';

import './FormDataStorageStep.scss';

const renderDataVolumeRows = ({
  fields,
  nodeIndex,
  volumeTypeChoices,
  defaultVolumeType,
  sizeLimit,
  sizeValidate,
  change,
}: any) => {
  return (
    <>
      {fields.length > 0 &&
        fields.map((volume, index) => (
          <FormSection key={index} name={volume} component={Fragment}>
            <FormNodeStorageRow
              parentName={`${fields.name}[${index}]`}
              typeName="volume_type"
              sizeName="size"
              altRowName={'#' + (index + 1)}
              volumeTypeChoices={volumeTypeChoices}
              defaultVolumeType={defaultVolumeType}
              sizeLimit={sizeLimit}
              sizeValidate={sizeValidate}
              change={change}
              onDeleteRow={() => fields.remove(index)}
            />

            {isFeatureVisible(RancherFeatures.volume_mount_point) && (
              <tr>
                <td>
                  <VolumeMountPointGroup nodeIndex={nodeIndex} />
                </td>
              </tr>
            )}
          </FormSection>
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
            <FormSection name={String(`attributes.nodes[${i}]`)}>
              <FieldArray
                name="data_volumes"
                component={renderDataVolumeRows}
                volumeTypeChoices={data?.volumeTypeChoices}
                defaultVolumeType={data?.defaultVolumeType}
                sizeLimit={limit}
                sizeValidate={[exceeds]}
                change={props.change}
                nodeIndex={i}
              />
            </FormSection>
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
