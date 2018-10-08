import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';

export const getUnfoldedRequests = (state): UnfoldedRequest[] => state.pythonManagementDetails.unfoldedRequests;
export const getWaldurPublicKey = (state): string => state.pythonManagementDetails.waldurPublicKey;
export const getAnsibleRequestTimeout = (state): string => state.config.plugins.WALDUR_ANSIBLE_COMMON.ANSIBLE_REQUEST_TIMEOUT;
export const getWaldurPublicKeyUuid = (state): string => state.config.plugins.WALDUR_ANSIBLE_COMMON.PUBLIC_KEY_UUID;
export const getPythonManagementLoaded = (state): string => state.pythonManagementDetails.loaded;
export const getPythonManagementErred = (state): string => state.pythonManagementDetails.erred;
