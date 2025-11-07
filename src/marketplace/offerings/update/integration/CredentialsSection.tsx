import { FC } from 'react';

import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  getCredentialsForm,
  showBackendId,
} from '@waldur/marketplace/common/registry';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingScopeState } from './OfferingScopeState';
import { SyncButton } from './SyncButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const TITLE = translate('Credentials');

export const CredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const CredentialsForm = getCredentialsForm(props.offering.type);

  const fields: OfferingEditField[] = [];
  if (showBackendId(props.offering.type)) {
    fields.push({
      label: translate('Backend ID'),
      key: 'backend_id',
      component: StringField,
    });
  }

  // When an offering has no scope, do not display the scope_state for Marketplace.Slurm type
  const hideScopeState =
    !props.offering.scope_state && props.offering.type === SITE_AGENT_PLUGIN;

  return (
    <FormTable.Card
      title={TITLE}
      actions={<SyncButton offering={props.offering} refetch={props.refetch} />}
      className="card-bordered mb-7"
    >
      <FormTable>
        {!hideScopeState && (
          <OfferingScopeState state={props.offering.scope_state || 'missing'} />
        )}
        {CredentialsForm ? (
          <CredentialsForm
            offering={props.offering}
            title={TITLE}
            callback={update}
          />
        ) : null}
        <DefaultOfferingEditPanel
          fields={fields}
          callback={update}
          {...props}
        />
      </FormTable>
    </FormTable.Card>
  );
};
