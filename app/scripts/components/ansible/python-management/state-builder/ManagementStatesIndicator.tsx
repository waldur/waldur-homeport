import { commonStateIndicatorBuilder } from '@waldur/ansible/python-management/state-builder/StateIndicatorBuilder';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { ResourceStateIndicator } from '@waldur/resource/state/ResourceState';
import * as React from 'react';

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
