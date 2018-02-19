import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubOAuthConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthConfig';
import { JupyterHubUser } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUser';

export class JupyterHubAuthenticationConfig {
  authenticationMethod: JupyterHubAuthenticationMethod = JupyterHubAuthenticationMethod.LINUX_PAM;

  jupyterHubOAuthConfig: JupyterHubOAuthConfig = new JupyterHubOAuthConfig();
  whitelistAdmins: boolean = false;
  jupyterHubOAuthAdminUsers: JupyterHubUser[] = [];
  jupyterHubWhitelistOAuthUsers: JupyterHubUser[] = [];

  jupyterHubLinuxUsers: JupyterHubUser[] = [];
}
