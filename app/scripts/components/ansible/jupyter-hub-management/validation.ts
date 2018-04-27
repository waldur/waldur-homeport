import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubUser } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUser';
import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { translate } from '@waldur/i18n';

export const validateJupyterHubUserPassword = (password: string, user: JupyterHubUser) =>
  (password && password.match(/\S/)) || (user && user.uuid)
    ? undefined
    : translate('New user needs password');

export const validateSessionTimeoutHours = (timeToLive: number) => timeToLive >= 1 ? undefined : translate('Session time to live should be creater than 1 hour');

const ADMIN_SHOULD_BE_SPECIFIED = 'At least one admin should be specified!';
const AT_LEAST_ONE_USER_SHOULD_BE_ENTERED = 'At least one user should be entered!';
const DONT_SPECIFY_ADMIN_IN_WHITELISTED_USER_LIST = 'You do not need to specify admin user here';

export const validateJupyterHubManagementForm = (formData: JupyterHubUsersHolder) => {
  const errors: any = {};
  const authenticationConfig = formData.authenticationConfig;
  if (authenticationConfig) {
    if (authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH) {
      if (!authenticationConfig.jupyterHubOAuthAdminUsers.length) {
        createAuthConfigIfNotPresent(errors);
        errors.authenticationConfig.jupyterHubOAuthAdminUsers = {_error: translate(ADMIN_SHOULD_BE_SPECIFIED)};
      }
      const adminsInWhitelistedRegularUsers = authenticationConfig.jupyterHubWhitelistOAuthUsers.some(
        u => authenticationConfig.jupyterHubOAuthAdminUsers.some(a => a.username === u.username));
      if (adminsInWhitelistedRegularUsers) {
        createAuthConfigIfNotPresent(errors);
        errors.authenticationConfig.jupyterHubWhitelistOAuthUsers = {_error: translate(DONT_SPECIFY_ADMIN_IN_WHITELISTED_USER_LIST)};
      }
    } else if (authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.LINUX_PAM) {
      if (!authenticationConfig.jupyterHubLinuxUsers.length) {
        createAuthConfigIfNotPresent(errors);
        errors.authenticationConfig.jupyterHubLinuxUsers = {_error: translate(AT_LEAST_ONE_USER_SHOULD_BE_ENTERED)};
      } else {
        const adminExists = authenticationConfig.jupyterHubLinuxUsers.some(u => u.admin);
        if (!adminExists) {
          createAuthConfigIfNotPresent(errors);
          errors.authenticationConfig.jupyterHubLinuxUsers = {_error: translate(ADMIN_SHOULD_BE_SPECIFIED)};
        }
      }
    }
  }
  return errors;
};

function createAuthConfigIfNotPresent(errors: any) {
  if (!errors.authenticationConfig) {
    errors.authenticationConfig = {};
  }
}
