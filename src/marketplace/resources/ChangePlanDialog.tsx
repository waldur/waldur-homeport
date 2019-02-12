import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { ChangePlanContainer } from './ChangePlanComponent';
import { loadData } from './ChangePlanLoader';

interface ChangePlanDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
  };
  submitting: boolean;
}

export const ChangePlanDialog: React.SFC<ChangePlanDialogProps> = props => (
  <Query
    variables={{resource_uuid: props.resolve.resource.marketplace_resource_uuid}}
    loader={loadData}
  >
    {({ loading, error, data }) => (
      <ModalDialog
        title={translate('Change resource plan')}
        footer={
          <>
            <CloseDialogButton/>
            {!loading && (
              <SubmitButton
                submitting={props.submitting}
                label={translate('Submit')}
              />
            )}
          </>
        }>
        {
          loading ? <LoadingSpinner/> :
          error ?  <h3>{translate('Unable to load data.')}</h3> :
          <ChangePlanContainer {...data}/>
        }
      </ModalDialog>
    )}
  </Query>
);

export default connectAngularComponent(ChangePlanDialog, ['resolve']);
