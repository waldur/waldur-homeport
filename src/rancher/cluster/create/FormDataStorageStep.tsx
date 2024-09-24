import { Plus } from '@phosphor-icons/react';
import { Fragment, useCallback, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FieldArray, FormName, FormSection } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { RancherFeatures } from '@waldur/FeaturesEnums';
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
  getRancherMountPointChoices,
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
  mountPoints,
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
                  <FormName>
                    {({ form }) => (
                      <VolumeMountPointGroup
                        form={form}
                        nodeIndex={nodeIndex}
                        volumeIndex={index}
                        mountPoints={mountPoints}
                      />
                    )}
                  </FormName>
                </td>
              </tr>
            )}
          </FormSection>
        ))}
      <tr>
        <td colSpan={4}>
          <Button
            variant="light"
            className="text-nowrap"
            onClick={() =>
              fields.push({ size: 1, volume_type: defaultVolumeType })
            }
          >
            <span className="svg-icon svg-icon-2">
              <Plus />
            </span>
            {translate('Add data volume')}
          </Button>
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

  const mountPoints = useMemo(() => getRancherMountPointChoices(), []);

  return (
    <VStepperFormStepCard
      title={translate('Data storage')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
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
                mountPoints={mountPoints}
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
