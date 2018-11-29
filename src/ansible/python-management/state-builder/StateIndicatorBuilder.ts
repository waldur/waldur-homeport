import { StateIndicatorProps } from '@waldur/core/StateIndicator';

import { ManagementRequestState } from '../types/ManagementRequestState';

const LABELS: {[key in ManagementRequestState]: string} = {
  [ManagementRequestState.OK]: 'OK',
  [ManagementRequestState.ERRED]: 'Erred',
  [ManagementRequestState.CREATION_SCHEDULED]: 'Execution Scheduled',
  [ManagementRequestState.CREATING]: 'Executing',
};

export const buildStateIndicator = (requestState: ManagementRequestState, tooltip: string): StateIndicatorProps => {
  return {
    variant: requestState === ManagementRequestState.ERRED ? 'danger' : 'primary',
    label: LABELS[requestState],
    active: requestState === ManagementRequestState.CREATION_SCHEDULED || requestState === ManagementRequestState.CREATING,
    tooltip,
  };
};
