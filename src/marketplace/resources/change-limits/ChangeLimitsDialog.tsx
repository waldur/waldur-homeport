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

export const ChangeLimitsDialog: React.FC<ChangeLimitsDialogProps> = props => (
  <Query
    variables={{
      resource_uuid: props.resolve.resource.marketplace_resource_uuid,
    }}
    loader={loadData}
  >
    {queryProps => (
      <DialogBody
        {...queryProps}
        initialValues={queryProps.data ? queryProps.data.initialValues : null}
      />
    )}
  </Query>
);

export default connectAngularComponent(ChangeLimitsDialog, ['resolve']);
