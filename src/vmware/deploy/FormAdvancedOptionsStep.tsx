import { useQuery } from '@tanstack/react-query';
import {
  VmwareCluster,
  vmwareClustersList,
  vmwareDatastoresList,
  vmwareFoldersList,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { FormContainer, SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

export const FormAdvancedOptionsStep = (props: FormStepProps) => {
  const advancedMode = !ENV.plugins.WALDUR_VMWARE.BASIC_MODE;

  const { data, isLoading } = useQuery({
    queryKey: ['vmware-advanced-options', props.offering.uuid],

    queryFn: async () => {
      const [clusters, datastores, folders] = await Promise.all([
        getAllPages((page) =>
          vmwareClustersList({
            query: {
              page,
              settings_uuid: props.offering.scope_uuid,
              customer_uuid: props.offering.customer_uuid,
            },
          }),
        ),
        getAllPages((page) =>
          vmwareDatastoresList({
            query: {
              page,
              settings_uuid: props.offering.scope_uuid,
              customer_uuid: props.offering.customer_uuid,
            },
          }),
        ),
        getAllPages((page) =>
          vmwareFoldersList({
            query: {
              page,
              settings_uuid: props.offering.scope_uuid,
              customer_uuid: props.offering.customer_uuid,
            },
          }),
        ),
      ]);
      return {
        clusters,
        datastores,
        folders,
      };
    },

    staleTime: 3 * 60 * 1000,
  });

  return (
    <VStepperFormStepCard
      title={translate('Advanced options')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      {data && (
        <FormContainer submitting={false} className="size-xl">
          {advancedMode && data.clusters.length > 0 && (
            <SelectField
              label={translate('Cluster')}
              name="attributes.cluster"
              options={data.clusters}
              getOptionValue={(option: VmwareCluster) => option.url}
              getOptionLabel={(option: VmwareCluster) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
          {advancedMode && data.datastores.length > 0 && (
            <SelectField
              label={translate('Datastore')}
              name="attributes.datastore"
              options={data.datastores}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
          {advancedMode && data.folders.length > 0 && (
            <SelectField
              label={translate('Folder')}
              name="attributes.folder"
              options={data.folders}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
        </FormContainer>
      )}
    </VStepperFormStepCard>
  );
};
