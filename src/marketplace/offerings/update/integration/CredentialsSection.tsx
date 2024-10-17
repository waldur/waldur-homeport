import { FC } from 'react';

import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  allowToUpdateService,
  showBackendId,
} from '@waldur/marketplace/common/registry';

import { FieldEditButton } from './FieldEditButton';
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

  return (
    <FormTable.Card
      title={TITLE}
      actions={<SyncButton offering={props.offering} refetch={props.refetch} />}
      className="card-bordered mb-7"
    >
      <FormTable>
        {allowToUpdateService(props.offering.type) && ServiceSettingsForm ? (
          <ServiceSettingsForm
            offering={props.offering}
            title={TITLE}
            callback={update}
          />
        ) : null}
        {showBackendId(props.offering.type) && (
          <FormTable.Item
            label={translate('Backend ID')}
            value={props.offering.backend_id || 'N/A'}
            actions={
              <FieldEditButton
                title={TITLE}
                scope={props.offering}
                name="backend_id"
                callback={update}
                fieldComponent={StringField}
              />
            }
          />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
