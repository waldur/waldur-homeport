import { JupyterHubOAuthType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthType';

export class JupyterHubOAuthConfig {
  type: JupyterHubOAuthType;
  oauthCallbackUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  gitlabHost: string;
}
