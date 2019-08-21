import * as React from 'react';

import { Query } from '@waldur/core/Query';
import { connectAngularComponent } from '@waldur/store/connect';

import { DialogBody } from './ChangeLimitsBody';
import { loadData } from './utils';

interface ChangeLimitsDialogProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
  };
  submitting: boolean;
}

export const ChangeLimitsDialog: React.SFC<ChangeLimitsDialogProps> = props => (
  <Query
    variables={{resource_uuid: props.resolve.resource.marketplace_resource_uuid}}
    loader={loadData}>
    {queryProps => <DialogBody {...queryProps}/>}
  </Query>
);

export default connectAngularComponent(ChangeLimitsDialog, ['resolve']);
