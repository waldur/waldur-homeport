import { StepCard } from 'waldur-ui';

import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';
import { FormAbstractVolumeFields } from '@/openstack/openstack-instance/deploy/FormAbstractVolumeFields';

import { InstallLonghornField } from './InstallLonghornField';

export const FormLonghornStep = (props: FormStepProps) => {
  const { attributes = {} } = useOrderFormData();
  const enabled: boolean = attributes.install_longhorn;
  const openstackOffering = attributes.openstack_offering;

  return (
    <StepCard
      title={translate('Longhorn')}
      id={props.id}
      disabled={props.disabled}
      disabledReason={props.disabledReason}
    >
      <InstallLonghornField />
      {enabled ? (
        <div className="mt-3">
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
    </StepCard>
  );
};
