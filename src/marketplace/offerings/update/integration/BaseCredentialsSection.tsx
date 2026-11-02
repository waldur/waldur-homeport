import { FC, PropsWithChildren, ReactNode } from 'react';

import { PropertyCard, PropertyList } from 'waldur-ui';

import { EditFieldProvider } from '@/form/editFields';
import { translate } from '@/i18n';

import { OfferingScopeState } from './OfferingScopeState';
import { SyncButton } from './SyncButton';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

export interface BaseCredentialsSectionProps extends PropsWithChildren<OfferingEditPanelProps> {
  actions?: ReactNode;
  hideScopeState?: boolean;
}

export const BaseCredentialsSection: FC<BaseCredentialsSectionProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <PropertyCard
      bordered
      title={translate('Credentials')}
      actions={
        <div className="flex gap-1.5 items-center">
          {props.actions}
          <SyncButton offering={props.offering} refetch={props.refetch} />
        </div>
      }
      className="mb-5.5"
    >
      <PropertyList>
        <EditFieldProvider scope={props.offering} callback={update}>
          {!props.hideScopeState && (
            <OfferingScopeState state={props.offering.scope_state} />
          )}
          {props.children}
        </EditFieldProvider>
      </PropertyList>
    </PropertyCard>
  );
};
