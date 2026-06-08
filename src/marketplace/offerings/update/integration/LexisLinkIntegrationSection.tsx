import { FC } from 'react';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import {
  EditFieldProvider,
  SecretEditField,
  StringEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

export const LexisLinkIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  if (!isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    return null;
  }

  return (
    <FormTable.Card
      title={translate('LEXIS integration')}
      className="card-bordered mb-7"
    >
      <EditFieldProvider scope={props.offering} callback={update}>
        <FormTable>
          <StringEditField
            name="plugin_options.heappe_url"
            label={translate('HEAppE URL')}
          />
          <StringEditField
            name="plugin_options.heappe_username"
            label={translate('HEAppE username')}
          />
          <StringEditField
            name="plugin_options.heappe_cluster_id"
            label={translate('HEAppE cluster ID')}
          />
          <StringEditField
            name="plugin_options.heappe_local_base_path"
            label={translate('HEAppE local base path')}
          />
          <SecretEditField
            name="secret_options.heappe_password"
            label={translate('HEAppE password')}
          />
          <SecretEditField
            name="secret_options.heappe_cluster_password"
            label={translate('HEAppE cluster password')}
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
