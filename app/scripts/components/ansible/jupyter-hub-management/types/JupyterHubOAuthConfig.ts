import { JupyterHubOAuthType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthType';

export class JupyterHubOAuthConfig {
  // Prevents nullpointers when playing around with radio buttons
  keeper: string = 'please do not remove this object, Redux-Form!';
  type: JupyterHubOAuthType;
  oauthCallbackUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
  gitlabHost: string;
}
