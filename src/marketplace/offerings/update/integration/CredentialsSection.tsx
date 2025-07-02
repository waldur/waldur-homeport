import { FC } from 'react';

import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  allowToUpdateService,
  showBackendId,
} from '@waldur/marketplace/common/registry';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingScopeState } from './OfferingScopeState';
import { getServiceSettingsForm } from './registry';
import { SyncButton } from './SyncButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const TITLE = translate('Credentials');

export const CredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const ServiceSettingsForm = getServiceSettingsForm(props.offering.type);

  const fields: OfferingEditField[] = [];
  if (showBackendId(props.offering.type)) {
    fields.push({
      label: translate('Backend ID'),
      key: 'backend_id',
      component: StringField,
    });
  }

  return (
    <FormTable.Card
      title={TITLE}
      actions={<SyncButton offering={props.offering} refetch={props.refetch} />}
      className="card-bordered mb-7"
    >
      <FormTable>
        <OfferingScopeState state={props.offering.scope_state || 'missing'} />
        {allowToUpdateService(props.offering.type) && ServiceSettingsForm ? (
          <ServiceSettingsForm
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
