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
import {
  canSeeOfferingSecretOptions,
  SECRET_OPTIONS_HIDDEN_REASON,
  useUpdateOfferingIntegration,
} from './utils';

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

  // Both passwords live in secret_options, which the backend omits from the
  // payload of anyone who may not change the offering's integration settings.
  // Editing one from an empty render would clear it in place.
  const secretOptionsHidden = !canSeeOfferingSecretOptions(props.offering);

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
            disabled={secretOptionsHidden}
            tooltip={
              secretOptionsHidden ? SECRET_OPTIONS_HIDDEN_REASON : undefined
            }
          />
          <SecretEditField
            name="secret_options.heappe_cluster_password"
            label={translate('HEAppE cluster password')}
            disabled={secretOptionsHidden}
            tooltip={
              secretOptionsHidden ? SECRET_OPTIONS_HIDDEN_REASON : undefined
            }
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
