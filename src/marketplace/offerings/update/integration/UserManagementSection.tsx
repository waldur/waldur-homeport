import { FC } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  getPluginOptionsForm,
  getSecretOptionsForm,
} from '@waldur/marketplace/common/registry';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const TITLE = translate('User management');

export const UserManagementSection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );
  const SecretOptionsForm = getSecretOptionsForm(props.offering.type);
  const PluginOptionsForm = getPluginOptionsForm(props.offering.type);

  return (
    <FormTable.Card title={TITLE} className="card-bordered mb-7">
      <FormTable>
        {SecretOptionsForm && (
          <SecretOptionsForm
            offering={props.offering}
            title={TITLE}
            callback={update}
          />
        )}
        {PluginOptionsForm && (
          <PluginOptionsForm
            offering={props.offering}
            title={TITLE}
            callback={update}
          />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
