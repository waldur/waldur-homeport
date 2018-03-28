import { STATE_READABLE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestTypeReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { StateIndicator } from '@waldur/resource/state/types';

interface PythonManagementRequestStateIndicatorBuilderMap {
  [key: string]: (PythonManagementRequestState) => StateIndicator;
}

class CommonStateIndicatorBuilder {

  public buildStateIndicator = <T extends ManagementRequestStateTypePair<T>>(request: T): StateIndicator => {
    const buildingFunction = this.REQUEST_STATE_STATE_INDICATOR_MAPPER[request.requestState];
    if (buildingFunction) {
      return buildingFunction(request);
    } else {
      return this.buildDefaultIndicator(request);
    }
  }

  private buildOkStateIndicator = <T extends ManagementRequestStateTypePair<T>>(request: T): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-primary';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = request.buildReadableTooltip(request);
    return stateIndicator;
  }

  private buildErredStateIndicator = <T extends ManagementRequestStateTypePair<T>>(request: T): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-danger';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = request.buildReadableTooltip(request);
    return stateIndicator;
  }

  private buildDefaultIndicator = <T extends ManagementRequestStateTypePair<T>>(request: T): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-info';
    stateIndicator.movementClassName = 'progress-striped active';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = request.buildReadableTooltip(request);
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
