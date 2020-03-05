import * as React from 'react';

import { Query } from '@waldur/core/Query';
import { connectAngularComponent } from '@waldur/store/connect';

import { DialogBody } from './ChangePlanBody';
import { loadData } from './utils';

interface ChangePlanDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
  };
  submitting: boolean;
}

export const ChangePlanDialog: React.FC<ChangePlanDialogProps> = props => (
  <Query
    variables={{
      resource_uuid: props.resolve.resource.marketplace_resource_uuid,
    }}
    loader={loadData}
  >
    {queryProps => (
      <DialogBody
        {...queryProps}
        initialValues={
          queryProps.data ? queryProps.data.initialValues : undefined
        }
      />
    )}
  </Query>
);

export default connectAngularComponent(ChangePlanDialog, ['resolve']);
