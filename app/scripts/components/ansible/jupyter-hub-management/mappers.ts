import { JupyterHubAuthenticationConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationConfig';
import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { JupyterHubManagementRequestType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequestType';
import { JupyterHubOAuthConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthConfig';
import { JupyterHubOAuthType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthType';
import { JupyterHubUser } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUser';
import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { PythonManagementDs } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementDs';
import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';
import {
  buildInstance,
  buildPythonManagementRequestFull,
  buildVirtualEnvironmentFormData,
  buildVirtualEnvironmentPayload,
  fillCommonManagementRequestFields
} from '@waldur/ansible/python-management/mappers';
import { ManagementRequestState } from '@waldur/ansible/python-management/types/ManagementRequestState';

export function buildJupyterHubManagementCreatePayload(formData: JupyterHubManagementFormData) {
  return {
    python_management: formData.selectedPythonManagement.url,
    session_time_to_live_hours: formData.sessionTimeToLiveHours,
    jupyter_hub_users: buildJupyterHubUsersPayload(formData),
    jupyter_hub_oauth_config: buildOAuthConfigPayload(formData),
    updated_virtual_environments: formData.selectedPythonManagement.virtualEnvironments.map(ve => buildVirtualEnvironmentPayload(ve)),
  };
}

export function buildJupyterHubManagementUpdatePayload(formData: JupyterHubManagementDetailsFormData) {
  return {
    python_management: formData.selectedPythonManagement.url,
    session_time_to_live_hours: formData.sessionTimeToLiveHours,
    jupyter_hub_users: buildJupyterHubUsersPayload(formData),
    jupyter_hub_oauth_config: buildOAuthConfigPayload(formData),
    updated_virtual_environments: formData.virtualEnvironments.map(ve => buildVirtualEnvironmentPayload(ve)),
  };
}

function buildJupyterHubUsersPayload(formData: JupyterHubUsersHolder) {
  return formData.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.LINUX_PAM ?
    formData.authenticationConfig.jupyterHubLinuxUsers.map(u => buildJupyterHubUserPayload(u)) : buildJupyterHubOAuthUsersPayload(formData.authenticationConfig);
}

function buildOAuthConfigPayload(formData: JupyterHubUsersHolder) {
  return formData.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH ?
    buildJupyterHubOAuthConfigPayload(formData.authenticationConfig) : null;
}

export function buildJupyterHubOAuthUsersPayload(config: JupyterHubAuthenticationConfig) {
  return config.jupyterHubOAuthAdminUsers.map(u => buildJupyterHubUserPayload(u, config.whitelistAdmins)).concat(
    config.jupyterHubWhitelistOAuthUsers.map(u => buildJupyterHubUserPayload(u, true)));
}

export function buildJupyterHubOAuthConfigPayload(config: JupyterHubAuthenticationConfig) {
  return {
    type: config.jupyterHubOAuthConfig.type,
    oauth_callback_url: config.jupyterHubOAuthConfig.oauthCallbackUrl,
    client_id: config.jupyterHubOAuthConfig.clientId,
    client_secret: config.jupyterHubOAuthConfig.clientSecret,
    tenant_id: config.jupyterHubOAuthConfig.tenantId,
    gitlab_host: config.jupyterHubOAuthConfig.gitlabHost ? config.jupyterHubOAuthConfig.gitlabHost : null,
  };
}

export function buildJupyterHubUserPayload(jupyterHubUser: JupyterHubUser, whitelisted?: boolean) {
  return {
    uuid: jupyterHubUser.uuid,
    username: jupyterHubUser.username,
    password: jupyterHubUser.password,
    admin: jupyterHubUser.admin ? true : false, // necessary hack to ensure that server doesn't throw required field missing validation exception
    whitelisted: whitelisted ? true : false,
  };
}

export function buildPythonManagementWithInstanceList(serverPayload: any): PythonManagementWithInstance {
  const result = new PythonManagementWithInstance();
  result.uuid = serverPayload.uuid;
  result.name = serverPayload.name;
  result.url = serverPayload.url;
  result.virtualEnvironmentsDirectory = serverPayload.virtual_envs_dir_path;
  result.virtualEnvironments = serverPayload.virtual_environments.map(ve => buildVirtualEnvironmentFormData(ve));
  result.instance = buildInstance(serverPayload.instance);
  return result;
}

export function buildJupyterHubManagementDetailsFormData(serverPayload: any): JupyterHubManagementDetailsFormData {
  const formData = new JupyterHubManagementDetailsFormData();
  const jupyterHubManagement = serverPayload.jupyter_hub_management;
  formData.uuid = jupyterHubManagement.uuid;
  formData.jupyterHubUrl = jupyterHubManagement.jupyter_hub_url ? 'https://' + jupyterHubManagement.jupyter_hub_url : null;
  formData.sessionTimeToLiveHours = jupyterHubManagement.session_time_to_live_hours;
  formData.managementState = jupyterHubManagement.state as ManagementRequestState;
  formData.requests = serverPayload.requests.map(r => buildJupyterRequest(r));

  formData.authenticationConfig = buildAuthenticationConfig(jupyterHubManagement);

  const selectedPythonManagement = serverPayload.selected_python_management;
  formData.selectedPythonManagement = new PythonManagementDs(selectedPythonManagement.uuid, selectedPythonManagement.name, selectedPythonManagement.url);

  formData.virtualEnvironments = selectedPythonManagement.virtual_environments.map(ve => buildVirtualEnvironmentFormData(ve));
  formData.pythonManagementRequests = serverPayload.python_management_requests.map(r => buildPythonManagementRequestFull(r));
  return formData;
}

function buildAuthenticationConfig(jupyterHubManagement: any) {
  const authenticationConfig = new JupyterHubAuthenticationConfig();
  authenticationConfig.authenticationMethod = jupyterHubManagement.jupyter_hub_oauth_config ? JupyterHubAuthenticationMethod.OAUTH : JupyterHubAuthenticationMethod.LINUX_PAM;
  authenticationConfig.jupyterHubOAuthConfig = buildJupyterHubOAuthConfig(jupyterHubManagement.jupyter_hub_oauth_config);
  if (jupyterHubManagement.jupyter_hub_oauth_config) {
    authenticationConfig.jupyterHubWhitelistOAuthUsers =
      jupyterHubManagement.jupyter_hub_users.filter(u => !u.admin && u.whitelisted).map(u => buildJupyterHubUser(u));
    authenticationConfig.jupyterHubOAuthAdminUsers = jupyterHubManagement.jupyter_hub_users.filter(u => u.admin).map(u => buildJupyterHubUser(u));
    authenticationConfig.whitelistAdmins = jupyterHubManagement.jupyter_hub_users.some(u => u.admin && u.whitelisted);
  } else {
    authenticationConfig.jupyterHubLinuxUsers = jupyterHubManagement.jupyter_hub_users.map(u => buildJupyterHubUser(u));
  }
  return authenticationConfig;
}

function buildJupyterHubOAuthConfig(jupyterHubOauthConfig: any) {
  if (jupyterHubOauthConfig) {
    const config = new JupyterHubOAuthConfig();
    config.type = findOAuthType(jupyterHubOauthConfig.type);
    config.clientSecret = jupyterHubOauthConfig.client_secret;
    config.clientId = jupyterHubOauthConfig.client_id;
    config.oauthCallbackUrl = jupyterHubOauthConfig.oauth_callback_url;
    config.tenantId = jupyterHubOauthConfig.tenant_id;
    config.gitlabHost = jupyterHubOauthConfig.gitlab_host;
    return config;
  }
  return null;
}

export const findOAuthType = (value: any): JupyterHubOAuthType => {
  let type;
  for (const key in JupyterHubOAuthType) {
    if (String(value) === JupyterHubOAuthType[key]) {
      type = JupyterHubOAuthType[key];
      break;
    }
  }
  return type;
};

export function buildJupyterRequest(serverPayload: any): JupyterHubManagementRequest {
  const request = new JupyterHubManagementRequest();
  fillCommonManagementRequestFields(serverPayload, request);
  request.requestType = serverPayload.request_type as JupyterHubManagementRequestType;
  return request;
}

export function buildJupyterHubUser(serverPayload: any): JupyterHubUser {
  return new JupyterHubUser({
    uuid: serverPayload.uuid,
    username: serverPayload.username,
    password: '',
    admin: serverPayload.admin,
  });
}
