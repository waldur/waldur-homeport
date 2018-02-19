import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';

type JupyterHubManagementRequestTypeReadabilityMap = {[key in JupyterHubManagementRequestType]: string};

export const JUPYTER_REQUEST_TYPE_READABLE_TEXT_MAPPING: JupyterHubManagementRequestTypeReadabilityMap = Object.freeze({
  [PythonManagementRequestType.OVERALL]: 'Overall state',
  [JupyterHubManagementRequestType.SYNC_CONFIGURATION]: 'Synchronize JupyterHub configuration',
  [JupyterHubManagementRequestType.LOCALIZE_VIRTUAL_ENV]: 'Make virtual environment local',
  [JupyterHubManagementRequestType.GLOBALIZE_VIRTUAL_ENV]: 'Make virtual environment global',
  [JupyterHubManagementRequestType.DELETE_JUPYTER_HUB]: 'Delete JupyterHub',
});

type PythonManagementRequestTypeReadabilityMap = {[key in PythonManagementRequestType]: string};

export const PYTHON_REQUEST_TYPE_READABLE_TEXT_MAPPING: PythonManagementRequestTypeReadabilityMap = Object.freeze({
  [PythonManagementRequestType.OVERALL]: 'Overall state',
  [PythonManagementRequestType.SYNCHRONIZATION]: 'Virtual environment synchronization',
  [PythonManagementRequestType.INITIALIZATION]: 'Virtual environment initialization',
  [PythonManagementRequestType.VIRTUAL_ENVS_SEARCH]: 'Virtual environments search',
  [PythonManagementRequestType.INSTALLED_LIBRARIES_SEARCH]: 'Installed libraries search',
  [PythonManagementRequestType.PYTHON_MANAGEMENT_DELETION]: 'Python management environment deletion',
  [PythonManagementRequestType.VIRTUAL_ENVIRONMENT_DELETION]: 'Virtual environment deletion',
});
