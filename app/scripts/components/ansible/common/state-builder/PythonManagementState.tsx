import * as React from 'react';

import { commonStateIndicatorBuilder } from '@waldur/ansible/common/state-builder/StateIndicatorBuilder';
import { ManagementRequestStateTypePair } from '@waldur/ansible/common/types/ManagementRequestStateTypePair';
import { ResourceStateIndicator } from '@waldur/resource/state/ResourceState';

interface ManagementStateProps<R extends ManagementRequestStateTypePair<R>> {
  requestsStates: R[];
}

export const PureManagementStatesIndicator = <R extends ManagementRequestStateTypePair<R>>(props: ManagementStateProps<R>) => {
  return (
      <>
        {props.requestsStates.map((state, index) =>
          <ResourceStateIndicator {...commonStateIndicatorBuilder.buildStateIndicator(state)} key={index}/>
        )}
      </>
  );
};
