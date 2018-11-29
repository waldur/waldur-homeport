import { StateIndicatorProps, StateVariant } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';

import { ManagementRequestState } from '../types/ManagementRequestState';

export const getLabel = (state: ManagementRequestState) => ({
  [ManagementRequestState.OK]: translate('OK'),
  [ManagementRequestState.ERRED]: translate('Erred'),
  [ManagementRequestState.CREATION_SCHEDULED]: translate('Execution Scheduled'),
  [ManagementRequestState.CREATING]: translate('Executing'),
}[state]);

export const isActive = (state: ManagementRequestState) =>
  [ManagementRequestState.CREATION_SCHEDULED, ManagementRequestState.CREATING].includes(state);

export const getVariant = (state: ManagementRequestState): StateVariant =>
  state === ManagementRequestState.ERRED ? 'danger' : 'primary';

export const buildStateIndicator = (state: ManagementRequestState, tooltip?: string): StateIndicatorProps => {
  return {
    variant: getVariant(state),
    label: getLabel(state),
    active: isActive(state),
    tooltip,
  };
};
