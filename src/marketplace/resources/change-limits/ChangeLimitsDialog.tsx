import React from 'react';
import { useAsync } from 'react-use';

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

export const ChangeLimitsDialog: React.FC<ChangeLimitsDialogProps> = (
  props,
) => {
  const asyncState = useAsync(
    () => loadData(props.resolve.resource.marketplace_resource_uuid),
    [props.resolve.resource.marketplace_resource_uuid],
  );
  return (
    <DialogBody
      asyncState={asyncState}
      initialValues={asyncState.value ? asyncState.value.initialValues : null}
    />
  );
};
