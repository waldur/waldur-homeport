import { FC } from 'react';

import { EditSchedulesButton } from '@/booking/EditSchedulesButton';
import { EditFieldProvider } from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { GoogleCalendarActions } from './GoogleCalendarActions';
import { RemoteActions } from './RemoteActions';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

export const BaseProvisioningConfigSection: FC<
  React.PropsWithChildren<OfferingEditPanelProps>
> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <FormTable.Card
      title={translate('Provisioning configuration')}
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
        <EditFieldProvider scope={props.offering} callback={update}>
          {props.children}
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
