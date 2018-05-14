import * as React from 'react';

import { JupyterHubUsersGroupForm } from '@waldur/ansible/jupyter-hub-management/form/JupyterHubUsersGroupForm';
import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { JupyterHubOAuthType } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthType';
import { JupyterHubUserAdminMode } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUserAdminMode';
import { JupyterHubUsersHolder } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubUsersHolder';
import { isNotBlank } from '@waldur/ansible/python-management/validation';
import { FormContainer, StringField } from '@waldur/form-react';
import { CheckboxField } from '@waldur/form-react/CheckboxField';
import { RadioButtonChoice, RadioButtonField } from '@waldur/form-react/RadioButtonField';
import { translate } from '@waldur/i18n';

export interface JupyterOAuthFormProps {
  jupyterHubManagement: JupyterHubUsersHolder;
  managementRequestTimeout: number;
  submitting: boolean;
  isGlobalRequestRunning?: boolean;
}

export const JupyterOAuthForm = (props: JupyterOAuthFormProps) => (
  <>
    {props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH &&
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-2"
      controlClass="col-sm-5">

      <RadioButtonField
        name="authenticationConfig.jupyterHubOAuthConfig.type"
        label={translate('OAuth2 type')}
        choices={[
          new RadioButtonChoice(JupyterHubOAuthType.GITLAB, 'GitLab'),
          new RadioButtonChoice(JupyterHubOAuthType.AZURE, 'Microsoft Azure'),
        ]}
        disabled={props.isGlobalRequestRunning}
        required={true}/>
      <div className="form-group">
        <label className="control-label col-sm-2">{translate('Additional information')}</label>
        <div className="same-padding-as-control-label col-sm-5">
          <a href="https://github.com/jupyterhub/oauthenticator"
             target="_blank">{translate('Where to get the required values from?')}</a>
          <br/>
          {props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig.type === JupyterHubOAuthType.AZURE &&
          <>
            <a
              href="https://www.netiq.com/communities/cool-solutions/creating-application-client-id-client-secret-microsoft-azure-new-portal/"
              target="_blank">
              {translate('How to obtain Client ID and Client secret from Azure')}
            </a>
          </>
          }
        </div>
      </div>
      {props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig.type === JupyterHubOAuthType.GITLAB &&
      <StringField
        name="authenticationConfig.jupyterHubOAuthConfig.gitlabHost"
        label={translate('GitLab host URL')}
        placeholder={'https://gitlab.com'}
        disabled={props.isGlobalRequestRunning}
        description={translate('If you use on-premise GitLab please specify the URl')}/>
      }
      <StringField
        name="authenticationConfig.jupyterHubOAuthConfig.oauthCallbackUrl"
        label={translate('Callback URL')}
        required={props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH}
        disabled={props.isGlobalRequestRunning}
        description={translate('Should be given to OAuth service provider. Example: https://VM_EXTERNAL_IP/hub/oauth_callback')}/>
      <StringField
        name="authenticationConfig.jupyterHubOAuthConfig.clientId"
        label={translate('Client ID')}
        required={props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH}
        disabled={props.isGlobalRequestRunning}
        description={translate('Should be obtained from OAuth service provider')}/>
      <StringField
        name="authenticationConfig.jupyterHubOAuthConfig.clientSecret"
        label={translate('Client Secret')}
        required={props.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH}
        disabled={props.isGlobalRequestRunning}
        description={translate('Should be obtained from OAuth service provider')}/>
      {props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig.type === JupyterHubOAuthType.AZURE &&
      <StringField
        name="authenticationConfig.jupyterHubOAuthConfig.tenantId"
        label={translate('Tenant ID')}
        required={props.jupyterHubManagement.authenticationConfig.jupyterHubOAuthConfig.type === JupyterHubOAuthType.AZURE}
        disabled={props.isGlobalRequestRunning}
        description={translate('Azure Active Directory ID')}/>
      }
      <JupyterHubUsersGroupForm
        jupyterHubManagement={props.jupyterHubManagement}
        managementRequestTimeout={0}
        label={'OAuth admin users'}
        adminCheckboxMode={JupyterHubUserAdminMode.ONLY_ADMINS}
        passwordEnabled={false}
        whitelisting={false}
        isGlobalRequestRunning={props.isGlobalRequestRunning}
        pathToJupyterHubUsers={'authenticationConfig.jupyterHubOAuthAdminUsers'}
        getJupyterHubUsers={(formData: JupyterHubManagementFormData) => formData.authenticationConfig.jupyterHubOAuthAdminUsers}/>
      <CheckboxField
        name="authenticationConfig.whitelistAdmins"
        label={translate('Whitelist admins')}
        checked={props.jupyterHubManagement.authenticationConfig.whitelistAdmins === true}
        disabled={props.isGlobalRequestRunning ||
        props.jupyterHubManagement.authenticationConfig.jupyterHubWhitelistOAuthUsers.some(u => isNotBlank(u.username))}
        description={translate('If no additional whitelisted users are specified, only admins will have access to JupyterHub.')
        + translate('If nobody is whitelisted, any OAuth user can log in to JupyterHub.')}/>
      <JupyterHubUsersGroupForm
        jupyterHubManagement={props.jupyterHubManagement}
        managementRequestTimeout={0}
        label={'Additional OAuth whitelisted users'}
        adminCheckboxMode={JupyterHubUserAdminMode.DISABLED}
        passwordEnabled={false}
        whitelisting={true}
        isGlobalRequestRunning={props.isGlobalRequestRunning}
        pathToJupyterHubUsers={'authenticationConfig.jupyterHubWhitelistOAuthUsers'}
        getJupyterHubUsers={(formData: JupyterHubManagementFormData) => formData.authenticationConfig.jupyterHubWhitelistOAuthUsers}/>
    </FormContainer>
    }
  </>
);
