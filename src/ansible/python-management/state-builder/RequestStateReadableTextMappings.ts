import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';

type JupyterHubManagementRequestTypeReadabilityMap = {[key in JupyterHubManagementRequestType]: string};

export const JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING: JupyterHubManagementRequestTypeReadabilityMap = {
  [JupyterHubManagementRequestType.SYNC_CONFIGURATION]: 'Synchronize JupyterHub configuration',
  [JupyterHubManagementRequestType.LOCALIZE_VIRTUAL_ENV]: 'Make virtual environment local',
  [JupyterHubManagementRequestType.GLOBALIZE_VIRTUAL_ENV]: 'Make virtual environment global',
  [JupyterHubManagementRequestType.DELETE_JUPYTER_HUB]: 'Delete JupyterHub',
};

type PythonManagementRequestTypeReadabilityMap = {[key in PythonManagementRequestType]: string};

export const PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING: PythonManagementRequestTypeReadabilityMap = {
  [PythonManagementRequestType.SYNCHRONIZATION]: 'Virtual environment synchronization',
  [PythonManagementRequestType.INITIALIZATION]: 'Virtual environment initialization',
  [PythonManagementRequestType.VIRTUAL_ENVS_SEARCH]: 'Virtual environments search',
  [PythonManagementRequestType.INSTALLED_LIBRARIES_SEARCH]: 'Installed libraries search',
  [PythonManagementRequestType.PYTHON_MANAGEMENT_DELETION]: 'Python management environment deletion',
  [PythonManagementRequestType.VIRTUAL_ENVIRONMENT_DELETION]: 'Virtual environment deletion',
};

type ManagementRequestTypeReadabilityMap = {[key in ManagementRequestState]: string};

export const MANAGEMENT_REQUEST_STATE_TEXT_MAPPING: ManagementRequestTypeReadabilityMap = {
  [ManagementRequestState.CREATING]: 'is being processed',
  [ManagementRequestState.CREATION_SCHEDULED]: 'has been scheduled for processing',
  [ManagementRequestState.ERRED]: 'has failed',
  [ManagementRequestState.OK]: 'has been successfully processed',
};
