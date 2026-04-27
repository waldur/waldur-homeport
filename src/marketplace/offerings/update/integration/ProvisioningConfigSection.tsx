import { FC } from 'react';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { EditSchedulesButton } from '@/booking/EditSchedulesButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import {
  getProvisioningConfigForm,
  getProvisioningConfigSection,
} from '@/marketplace/common/registry';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';

import { GoogleCalendarActions } from './GoogleCalendarActions';
import { RemoteActions } from './RemoteActions';
import { ScriptIntegrationSummary } from './ScriptIntegrationSummary';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const getTitle = () => translate('Provisioning configuration');

export const ProvisioningConfigSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );
  const CustomSection = getProvisioningConfigSection(props.offering.type);
  const ProvisioningConfigForm = getProvisioningConfigForm(props.offering.type);

  if (
    !CustomSection &&
    !ProvisioningConfigForm &&
    ![OFFERING_TYPE_CUSTOM_SCRIPTS, OFFERING_TYPE_BOOKING].includes(
      props.offering.type,
    )
  ) {
    return null;
  }

  if (props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
    return <ScriptIntegrationSummary {...props} />;
  }

  if (CustomSection) {
    return <CustomSection {...props} />;
  }

  return (
    <FormTable.Card
      title={getTitle()}
      actions={
        <>
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
        </>
      }
      className="card-bordered mb-7"
    >
      <FormTable>
        {ProvisioningConfigForm && (
          <ProvisioningConfigForm
            offering={props.offering}
            title={getTitle()}
            callback={update}
          />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
