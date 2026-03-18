import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  getCredentialsForm,
  showBackendId,
} from '@waldur/marketplace/common/registry';
import { openModalDialog } from '@waldur/modal/actions';
import { TENANT_TYPE } from '@waldur/openstack/constants';
import { SITE_AGENT_PLUGIN } from '@waldur/site-agent/constants';
import { SlurmOfferingActions } from '@waldur/site-agent/SlurmOfferingActions';
import { ActionButton } from '@waldur/table/ActionButton';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingScopeState } from './OfferingScopeState';
import { SyncButton } from './SyncButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const OpenStackDiscoveryDialog = lazyComponent(() =>
  import('@waldur/openstack/openstack-discovery/OpenStackDiscoveryDialog').then(
    (module) => ({
      default: module.OpenStackDiscoveryDialog,
    }),
  ),
);

const getTitle = () => translate('Credentials');

export const CredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  const dispatch = useDispatch();
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
                dispatch(
                  openModalDialog(OpenStackDiscoveryDialog, {
                    size: 'xl',
                    resolve: {
                      offering: props.offering,
                      refetch: props.refetch,
                    },
                  }),
                )
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
