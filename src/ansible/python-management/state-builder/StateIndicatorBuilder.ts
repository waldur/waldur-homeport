import { STATE_READABLE_TEXT_MAPPING } from '@waldur/ansible/python-management/state-builder/RequestTypeReadableTextMappings';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { StateIndicator } from '@waldur/resource/state/types';

interface PythonManagementRequestStateIndicatorBuilderMap {
  [key: string]: (PythonManagementRequestState, tooltip: string) => StateIndicator;
}

class CommonStateIndicatorBuilder {

  public buildStateIndicator = (requestState: ManagementRequestState, tooltip: string): StateIndicator => {
    const buildingFunction = this.REQUEST_STATE_STATE_INDICATOR_MAPPER[requestState];
    if (buildingFunction) {
      return buildingFunction(requestState, tooltip);
    } else {
      return this.buildDefaultIndicator(requestState, tooltip);
    }
  }

  private buildOkStateIndicator = (requestState: ManagementRequestState, tooltip: string): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.variant = 'primary';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    stateIndicator.tooltip = tooltip;
    return stateIndicator;
  }

  private buildErredStateIndicator = (requestState: ManagementRequestState, tooltip: string): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.variant = 'danger';
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    stateIndicator.tooltip = tooltip;
    return stateIndicator;
  }

  private buildDefaultIndicator = (requestState: ManagementRequestState, tooltip: string): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.variant = 'info';
    stateIndicator.active = true;
    stateIndicator.label = STATE_READABLE_TEXT_MAPPING[requestState];
    stateIndicator.tooltip = tooltip;
    return stateIndicator;
  }

  private buildEmptyStateIndicator = (): StateIndicator => {
    return {
      variant: 'primary',
      label: '',
      tooltip: '',
      active: false,
    };
  }

  private REQUEST_STATE_STATE_INDICATOR_MAPPER: PythonManagementRequestStateIndicatorBuilderMap = {
    [ManagementRequestState.OK]: this.buildOkStateIndicator,
    [ManagementRequestState.ERRED]: this.buildErredStateIndicator,
  };
}

export const commonStateIndicatorBuilder = new CommonStateIndicatorBuilder();
