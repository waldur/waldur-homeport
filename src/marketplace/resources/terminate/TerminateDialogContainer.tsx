import React from 'react';
import { useAsync } from 'react-use';

import { getResource } from '@waldur/marketplace/common/api';

import { TerminateContainer } from './TerminateContainer';

interface TerminateDialogContainerProps {
  resolve: {
    resource: {
      marketplace_resource_uuid: string;
    };
    dialogSubtitle?: string;
  };
}

export const TerminateDialogContainer: React.FC<TerminateDialogContainerProps> = (
  props,
) => {
  const asyncState = useAsync(
    () => getResource(props.resolve.resource.marketplace_resource_uuid),
    [props.resolve.resource.marketplace_resource_uuid],
  );
  return (
    <TerminateContainer
      asyncState={asyncState}
      dialogSubtitle={props.resolve.dialogSubtitle}
    />
  );
};
