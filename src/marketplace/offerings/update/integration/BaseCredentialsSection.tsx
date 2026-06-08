import { FC, PropsWithChildren, ReactNode } from 'react';

import { EditFieldProvider } from '@/form/editFields';
import FormTable from '@/form/FormTable';
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
    <FormTable.Card
      title={translate('Credentials')}
      actions={
        <div className="d-flex gap-2 align-items-center">
          {props.actions}
          <SyncButton offering={props.offering} refetch={props.refetch} />
        </div>
      }
      className="card-bordered mb-7"
    >
      <FormTable>
        <EditFieldProvider scope={props.offering} callback={update}>
          {!props.hideScopeState && (
            <OfferingScopeState
              state={props.offering.scope_state || 'missing'}
            />
          )}
          {props.children}
        </EditFieldProvider>
      </FormTable>
    </FormTable.Card>
  );
};
