import { useQueries } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { openstackFlavorsList } from 'waldur-js-client';

import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { Offering } from '@waldur/marketplace/types';
import { loadVolumeTypes } from '@waldur/openstack/api';
import { FormAbstractVolumeFields } from '@waldur/openstack/openstack-instance/deploy/FormAbstractVolumeFields';

import { InstallLonghornField } from './InstallLonghornField';

export const FormLonghornStep = (props: FormStepProps) => {
  const enabled: boolean = useSelector((state) =>
    orderFormSelector(state, 'attributes.install_longhorn'),
  );
  const openstackOffering: Offering = useSelector((state) =>
    orderFormSelector(state, 'attributes.openstack_offering'),
  );
  const [_, _volume_types] = useQueries({
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
        <div className="mt-4">
          <FormAbstractVolumeFields
            {...props}
            offering={openstackOffering}
            typeTitle={translate('Longhorn volume type for worker nodes')}
            sizeTitle={translate('Longhorn volume size for worker nodes (GB)')}
            helpText={translate('Detachable and resizable data disk')}
            typeField="attributes.worker_nodes_longhorn_volume_type_name"
            sizeField="attributes.worker_nodes_longhorn_volume_size"
            hideQuotas
          />
        </div>
      ) : null}
    </VStepperFormStepCard>
  );
};
