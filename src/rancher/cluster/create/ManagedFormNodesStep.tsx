import { useQueries } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import {
  OpenStackFlavor,
  openstackFlavorsList,
  OpenStackVolumeType,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { BoxNumberField } from '@waldur/form/BoxNumberField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import {
  formatIntField,
  parseIntField,
} from '@waldur/marketplace/common/utils';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { Offering } from '@waldur/marketplace/types';
import { loadVolumeTypes } from '@waldur/openstack/api';

import { IntegerUnitField } from './IntegerUnitField';
import { LonghornWorkerWarning } from './LonghornWorkerWarning';

export const ManagedFormNodesStep = (props: FormStepProps) => {
  const openstackOffering: Offering = useSelector((state) =>
    orderFormSelector(state, 'attributes.openstack_offering'),
  );
  const [flavors, volumeTypes] = useQueries({
    queries: [
      {
        queryKey: ['nodes-step-flavors', props.offering.uuid],
        queryFn: () =>
          openstackFlavorsList({
            query: {
              settings_uuid: openstackOffering.scope_uuid,
              field: ['display_name', 'name', 'cores', 'ram'],
            },
          }).then((response) => response.data),
        enabled: !!openstackOffering,
      },
      {
        queryKey: ['nodes-step-volume-types', props.offering.uuid],
        queryFn: () =>
          loadVolumeTypes({
            settings_uuid: openstackOffering.scope_uuid,
          }),
        enabled: !!openstackOffering,
      },
    ],
  });

  const isLoading = [flavors, volumeTypes].some((result) => result.isLoading);

  return (
    <VStepperFormStepCard
      title={translate('Worker nodes hardware configuration')}
      id={props.id}
      loading={openstackOffering && isLoading}
      disabled={!openstackOffering || props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <div className="mb-2 border-bottom">
        <FormGroup label={translate('Number of nodes')} required={true}>
          <Field
            name="attributes.worker_nodes_count"
            component={BoxNumberField}
            min={1}
            validate={[required]}
            parse={parseIntField}
            format={formatIntField}
          />
        </FormGroup>
      </div>
      <div className="mb-2 border-bottom">
        <FormGroup label={translate('OpenStack flavor')} required={true}>
          <Field
            name="attributes.worker_nodes_flavor"
            component={SelectField}
            options={flavors.data}
            getOptionValue={(option: OpenStackFlavor) => option.name}
            getOptionLabel={(option: OpenStackFlavor) => option.display_name}
          />
        </FormGroup>
        <LonghornWorkerWarning />
      </div>
      <div className="mb-2 border-bottom">
        <FormGroup label={translate('Data volume size')} required={true}>
          <Field
            name="attributes.worker_nodes_data_volume_size"
            units={translate('GB')}
            component={IntegerUnitField}
            parse={parseIntField}
            format={formatIntField}
            validate={required}
          />
        </FormGroup>
      </div>
      {volumeTypes.data?.length ? (
        <div className="mb-2 border-bottom">
          <FormGroup label={translate('Data volume type')} required={true}>
            <Field
              name="attributes.worker_nodes_data_volume_type_name"
              component={SelectField}
              options={volumeTypes.data}
              getOptionValue={(option: OpenStackVolumeType) => option.uuid}
              getOptionLabel={(option: OpenStackVolumeType) => option.name}
            />
          </FormGroup>
        </div>
      ) : null}
    </VStepperFormStepCard>
  );
};
