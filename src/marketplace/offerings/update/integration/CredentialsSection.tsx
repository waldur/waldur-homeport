import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { StringField } from '@/form';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import {
  getCredentialsForm,
  showBackendId,
} from '@/marketplace/common/registry';
import { useModal } from '@/modal/actions';
import { TENANT_TYPE } from '@/openstack/constants';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import { SlurmOfferingActions } from '@/site-agent/SlurmOfferingActions';
import { ActionButton } from '@/table/ActionButton';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingScopeState } from './OfferingScopeState';
import { SyncButton } from './SyncButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const OpenStackDiscoveryDialog = lazyComponent(() =>
  import('@/openstack/openstack-discovery/OpenStackDiscoveryDialog').then(
    (module) => ({
      default: module.OpenStackDiscoveryDialog,
    }),
  ),
);

const getTitle = () => translate('Credentials');

export const CredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  const { openDialog } = useModal();
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
      title={getTitle()}
      actions={
        <div className="d-flex gap-2 align-items-center">
          <SlurmOfferingActions offering={props.offering} />
          {props.offering.type === TENANT_TYPE && (
            <ActionButton
              action={() =>
                openDialog(OpenStackDiscoveryDialog, {
                  size: 'xl',
                  resolve: {
                    offering: props.offering,
                    refetch: props.refetch,
                  },
                })
              }
              variant="tertiary"
              iconNode={<MagnifyingGlassIcon weight="bold" />}
              title={translate('Discover')}
              data-testid="credentials-discover-btn"
            />
          )}
          <SyncButton offering={props.offering} refetch={props.refetch} />
        </div>
      }
      className="card-bordered mb-7"
    >
      <FormTable>
        {!hideScopeState && (
          <OfferingScopeState state={props.offering.scope_state || 'missing'} />
        )}
        {CredentialsForm ? (
          <CredentialsForm
            offering={props.offering}
            title={getTitle()}
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
