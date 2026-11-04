import { FC } from 'react';

import { PropertyCard, PropertyList } from 'waldur-ui';

import { EditFieldProvider, StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

// The HPC workspace is optional: an offering without a FirecREST URL and
// system name has none, and one whose URL staff have not allowed (Marketplace
// settings → HPC workspace) has none either, because the user's identity
// provider token is sent there.
export const HpcWorkspaceIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <>
      <p className="text-secondary mb-5">
        {translate(
          'Optional. When set, allocations of this offering get Jobs, Files, Insights, Cluster and Software tabs that work on the cluster as the signed-in user through FirecREST v2. The FirecREST URL must also be allowed by staff in Marketplace settings → HPC workspace, and users must sign in through the identity provider FirecREST trusts.',
        )}
      </p>
      <PropertyCard bordered title={translate('FirecREST')} className="mb-7">
        <EditFieldProvider scope={props.offering} callback={update}>
          <PropertyList>
            <StringEditField
              name="plugin_options.firecrest_api_url"
              label={translate('FirecREST API URL')}
              description={translate(
                'FirecREST v2 API URL, e.g. https://firecrest.example.org. Leave empty to turn the HPC workspace off.',
              )}
              parse={(value) => value ?? ''}
            />
            <StringEditField
              name="plugin_options.firecrest_system_name"
              label={translate('FirecREST system name')}
              description={translate(
                "The cluster's name in FirecREST's systems list.",
              )}
              parse={(value) => value ?? ''}
            />
          </PropertyList>
        </EditFieldProvider>
      </PropertyCard>
      <PropertyCard bordered title={translate('Job performance (optional)')}>
        <EditFieldProvider scope={props.offering} callback={update}>
          <PropertyList>
            <StringEditField
              name="plugin_options.slurm_monitor_api_url"
              label={translate('slurm-monitor API URL')}
              description={translate(
                'slurm-monitor URL ending in /api/v2, for per-job GPU, CPU and memory over time. Must be allowed by staff in Marketplace settings → HPC workspace. Leave empty to hide job performance.',
              )}
              parse={(value) => value ?? ''}
            />
            <StringEditField
              name="plugin_options.slurm_monitor_cluster_name"
              label={translate('slurm-monitor cluster name')}
              description={translate("The cluster's name in slurm-monitor.")}
              parse={(value) => value ?? ''}
            />
          </PropertyList>
        </EditFieldProvider>
      </PropertyCard>
    </>
  );
};
