import * as React from 'react';

import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { buildStateIndicator } from './StateIndicatorBuilder';

interface ManagementStateProps {
  managementState: ManagementRequestState;
}

export const PureManagementStatesIndicator = (props: ManagementStateProps) => (
  <StateIndicator {...buildStateIndicator(props.managementState, translate('Overall state of the service'))}/>
);
