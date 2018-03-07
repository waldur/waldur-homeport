import { UnfoldedRequest } from '@waldur/python-management/types/UnfoldedRequest';

export const getDetailsPollingTask = (state): number => state.pythonManagementDetails.detailsPollingTask;
export const getUnfoldedRequests = (state): UnfoldedRequest[] => state.pythonManagementDetails.unfoldedRequests;
export const getWaldurPublicKey = (state): string => state.pythonManagementDetails.waldurPublicKey;
export const getPythonManagementRequestTimeout = (state): string => state.config.plugins.WALDUR_PYTHON_MANAGEMENT.PYTHON_MANAGEMENT_TIMEOUT;
export const getWaldurPublicKeyUuid = (state): string => state.config.plugins.WALDUR_PLAYBOOK_JOBS.PUBLIC_KEY_UUID;
export const getPythonManagementLoaded = (state): string => state.pythonManagementDetails.loaded;
export const getPythonManagementErred = (state): string => state.pythonManagementDetails.erred;
