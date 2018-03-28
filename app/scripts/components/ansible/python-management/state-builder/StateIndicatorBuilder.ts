import { STATE_READABLE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestTypeReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { StateIndicator } from '@waldur/resource/state/types';

interface PythonManagementRequestStateIndicatorBuilderMap {
  [key: string]: (PythonManagementRequestState) => StateIndicator;
}

class CommonStateIndicatorBuilder {

  public buildStateIndicator = (requestState: ManagementRequestState): StateIndicator => {
    const buildingFunction = this.REQUEST_STATE_STATE_INDICATOR_MAPPER[requestState];
    if (buildingFunction) {
      return buildingFunction(requestState);
    } else {
      return this.buildDefaultIndicator(requestState);
    }
  }

  private buildOkStateIndicator = (requestState: ManagementRequestState): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-primary';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    return stateIndicator;
  }

  private buildErredStateIndicator = (requestState: ManagementRequestState): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-danger';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    return stateIndicator;
  }

  private buildDefaultIndicator = (requestState: ManagementRequestState): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-info';
    stateIndicator.movementClassName = 'progress-striped active';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    return stateIndicator;
  }

  private buildEmptyStateIndicator = (): StateIndicator => {
    return {
      className: '',
      label: '',
      tooltip: '',
      movementClassName: '',
    };
  }

  REQUEST_STATE_STATE_INDICATOR_MAPPER: PythonManagementRequestStateIndicatorBuilderMap = {
    [ManagementRequestState.OK]: this.buildOkStateIndicator,
    [ManagementRequestState.ERRED]: this.buildErredStateIndicator,
  };
}

export const commonStateIndicatorBuilder = new CommonStateIndicatorBuilder();
