import React from 'react';
import { useAsync } from 'react-use';

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

export const ChangePlanDialog: React.FC<ChangePlanDialogProps> = (props) => {
  const asyncState = useAsync(
    () => loadData(props.resolve.resource.marketplace_resource_uuid),
    [props.resolve.resource.marketplace_resource_uuid],
  );
  return (
    <DialogBody
      asyncState={asyncState}
      initialValues={
        asyncState.value ? asyncState.value.initialValues : undefined
      }
    />
  );
};
