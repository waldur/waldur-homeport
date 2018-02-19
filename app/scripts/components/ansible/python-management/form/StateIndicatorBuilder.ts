import { PythonManagementRequestState } from '@waldur/ansible/python-management/types/PythonManagementRequestState';
import { PythonManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/PythonManagementRequestStateTypePair';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import { translate } from '@waldur/i18n/';
import { StateIndicator } from '@waldur/resource/state/types';

interface PythonManagementRequestStateIndicatorBuilderMap { [key: string]: (PythonManagementRequestState) => StateIndicator; }

type PythonManagementRequestStateReadabilityMap = {[key in PythonManagementRequestState]: string};

type PythonManagementRequestTypeReadabilityMap = {[key in PythonManagementRequestType]: string};

export const TYPE_READABLE_TEXT_MAPPING: PythonManagementRequestTypeReadabilityMap = Object.freeze({
  [PythonManagementRequestType.OVERALL]: 'Overall state',
  [PythonManagementRequestType.SYNCHRONIZATION]: 'Virtual environment synchronization',
  [PythonManagementRequestType.INITIALIZATION]: 'Virtual environment initialization',
  [PythonManagementRequestType.VIRTUAL_ENVS_SEARCH]: 'Virtual environments search',
  [PythonManagementRequestType.INSTALLED_LIBRARIES_SEARCH]: 'Installed libraries search',
  [PythonManagementRequestType.PYTHON_MANAGEMENT_DELETION]: 'Python management environment deletion',
  [PythonManagementRequestType.VIRTUAL_ENVIRONMENT_DELETION]: 'Virtual environment deletion',
});

class StateIndicatorBuilder {

  public buildStateIndicator = (request: PythonManagementRequestStateTypePair): StateIndicator => {
    const buildingFunction = this.REQUEST_STATE_STATE_INDICATOR_MAPPER[request.requestState];
    if (buildingFunction) {
      return buildingFunction(request);
    } else {
      return this.buildDefaultIndicator(request);
    }
  }

  private buildOkStateIndicator = (request: PythonManagementRequestStateTypePair): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-primary';
    stateIndicator.label = this.STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = translate(TYPE_READABLE_TEXT_MAPPING[request.requestType]);
    return stateIndicator;
  }

  private buildErredStateIndicator = (request: PythonManagementRequestStateTypePair): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-danger';
    stateIndicator.label = this.STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = translate(TYPE_READABLE_TEXT_MAPPING[request.requestType]);
    return stateIndicator;
  }

  private buildDefaultIndicator = (request: PythonManagementRequestStateTypePair): StateIndicator => {
    const stateIndicator = this.buildEmptyStateIndicator();
    stateIndicator.className = 'progress-bar-primary';
    stateIndicator.movementClassName = 'progress-striped active';
    stateIndicator.label = this.STATE_READABLE_TEXT_MAPPING[request.requestState];
    stateIndicator.tooltip = translate(TYPE_READABLE_TEXT_MAPPING[request.requestType]);
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

  STATE_READABLE_TEXT_MAPPING: PythonManagementRequestStateReadabilityMap = Object.freeze({
    [PythonManagementRequestState.OK]: 'OK',
    [PythonManagementRequestState.ERRED]: 'Erred',
    [PythonManagementRequestState.CREATION_SCHEDULED]: 'Execution Scheduled',
    [PythonManagementRequestState.CREATING]: 'Executing',
    // currently not used states
    [PythonManagementRequestState.UPDATE_SCHEDULED]: 'Update Scheduled',
    [PythonManagementRequestState.UPDATING]: 'Updating',
    [PythonManagementRequestState.DELETION_SCHEDULED]: 'Deletion Scheduled',
    [PythonManagementRequestState.DELETING]: 'Deleting',
  });

  REQUEST_STATE_STATE_INDICATOR_MAPPER: PythonManagementRequestStateIndicatorBuilderMap = Object.freeze({
    [PythonManagementRequestState.OK]: this.buildOkStateIndicator,
    [PythonManagementRequestState.ERRED]: this.buildErredStateIndicator,
  });
}

export const stateIndicatorBuilder = new StateIndicatorBuilder();
