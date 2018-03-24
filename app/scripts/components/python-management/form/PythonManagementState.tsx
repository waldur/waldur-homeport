import * as React from 'react';

import { stateIndicatorBuilder } from '@waldur/python-management/form/StateIndicatorBuilder';
import { PythonManagementRequestStateTypePair } from '@waldur/python-management/types/PythonManagementRequestStateTypePair';
import { ResourceStateIndicator } from '@waldur/resource/state/ResourceState';

interface PythonManagementStateProps {
  requestsStates: PythonManagementRequestStateTypePair[];
}

export const PurePythonManagementStatesIndicator = (props: PythonManagementStateProps) => (
  <>
    {props.requestsStates.map((state, index) =>
      <ResourceStateIndicator {...stateIndicatorBuilder.buildStateIndicator(state)} key={index}/>
    )}
  </>
);
