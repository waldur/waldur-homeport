import { useQuery } from '@tanstack/react-query';
import {
  VmwareCluster,
  vmwareClustersList,
  vmwareDatastoresList,
  vmwareFoldersList,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { ENV } from '@/core/config';
import { UI_STALE_TIME } from '@/core/constants';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { VStepperFormStepCard } from '@/wizard';

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
              page_size: MAX_PAGE_SIZE,
              settings_uuid: props.offering.scope_uuid,
              customer_uuid: props.offering.customer_uuid,
            },
          }),
        ),
        getAllPages((page) =>
          vmwareDatastoresList({
            query: {
              page,
              page_size: MAX_PAGE_SIZE,
              settings_uuid: props.offering.scope_uuid,
              customer_uuid: props.offering.customer_uuid,
            },
          }),
        ),
        getAllPages((page) =>
          vmwareFoldersList({
            query: {
              page,
              page_size: MAX_PAGE_SIZE,
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

    staleTime: UI_STALE_TIME,
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
        <div className="size-xl">
          {advancedMode && data.clusters.length > 0 && (
            <SelectGroup
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
            <SelectGroup
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
            <SelectGroup
              label={translate('Folder')}
              name="attributes.folder"
              options={data.folders}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              isClearable={true}
              noUpdateOnBlur
            />
          )}
        </div>
      )}
    </VStepperFormStepCard>
  );
};
