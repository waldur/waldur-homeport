import { FC } from 'react';

import { PropertyCard, PropertyList } from 'waldur-ui';

import { EditSchedulesButton } from '@/booking/EditSchedulesButton';
import { EditFieldProvider } from '@/form/editFields';
import { translate } from '@/i18n';

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
    <PropertyCard
      bordered
      title={translate('Provisioning configuration')}
      actions={
        <>
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
        </>
      }
      className="mb-5.5"
    >
      <PropertyList>
        <EditFieldProvider scope={props.offering} callback={update}>
          {props.children}
        </EditFieldProvider>
      </PropertyList>
    </PropertyCard>
  );
};
