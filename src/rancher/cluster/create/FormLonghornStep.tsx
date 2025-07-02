import { useQueries } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Field } from 'redux-form';
import { openstackFlavorsList, OpenStackVolumeType } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
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

import { InstallLonghornField } from './InstallLonghornField';
import { IntegerUnitField } from './IntegerUnitField';

export const FormLonghornStep = (props: FormStepProps) => {
  const enabled: boolean = useSelector((state) =>
    orderFormSelector(state, 'attributes.install_longhorn'),
  );
  const openstackOffering: Offering = useSelector((state) =>
    orderFormSelector(state, 'attributes.openstack_offering'),
  );
  const [_, volumeTypes] = useQueries({
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

  return (
    <VStepperFormStepCard
      title={translate('Longhorn')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <InstallLonghornField />
      {enabled ? (
        <FormGroup
          label={translate('Longhorn volume size for worker nodes')}
          required={true}
        >
          <Field
            name="attributes.worker_nodes_longhorn_volume_size"
            units={translate('GB')}
            component={IntegerUnitField}
            parse={parseIntField}
            format={formatIntField}
            validate={required}
          />
        </FormGroup>
      ) : null}
      {enabled && volumeTypes.data?.length ? (
        <FormGroup
          label={translate('Longhorn volume type for worker nodes')}
          required={true}
        >
          <Field
            name="attributes.worker_nodes_longhorn_volume_type_name"
            component={SelectField}
            options={volumeTypes.data}
            getOptionValue={(option: OpenStackVolumeType) => option.uuid}
            getOptionLabel={(option: OpenStackVolumeType) => option.name}
          />
        </FormGroup>
      ) : null}
    </VStepperFormStepCard>
  );
};
