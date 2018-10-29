import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import * as jupyterHubActions from '@waldur/ansible/jupyter-hub-management/actions';
import { JUPYTER_HUB_MANAGEMENT_CREATE_FORM_NAME } from '@waldur/ansible/jupyter-hub-management/constants';
import { JupyterHubManagementCreateForm } from '@waldur/ansible/jupyter-hub-management/create/JupyterHubManagementForm';
import {
getAvailablePythonManagements,
getJupyterHubManagementCreateErred,
getJupyterHubManagementCreateLoaded
} from '@waldur/ansible/jupyter-hub-management/selectors';
import { JupyterHubAuthenticationMethod } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubAuthenticationMethod';
import { JupyterHubManagementFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementFormData';
import { JupyterHubOAuthConfig } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubOAuthConfig';
import { PythonManagementWithInstance } from '@waldur/ansible/jupyter-hub-management/types/PythonManagementWithInstance';
import { validateJupyterHubManagementForm } from '@waldur/ansible/jupyter-hub-management/validation';
import * as pythonActions from '@waldur/ansible/python-management/actions';
import { getWaldurPublicKey, getWaldurPublicKeyUuid } from '@waldur/ansible/python-management/selectors';
import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { translate, TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

export interface JupyterHubManagementCreateProps extends InjectedFormProps, TranslateProps {
  project: Project;
  waldurPublicKey: string;
  waldurPublicKeyUuid: string;
  availablePythonManagements: PythonManagementWithInstance[];
  loaded: boolean;
  erred: boolean;
  createJupyterHubManagement: (jupyterHubManagement: JupyterHubManagementFormData) => Promise<void>;
  gotoApplicationsList: () => Promise<void>;
  jupyterHubManagement: JupyterHubManagementFormData;
  saveWaldurPublicKey: (waldurPublicKey: string) => void;
  initializeJupyterHubManagementCreate: () => Promise<void>;
  jupyterHubManagementErred: () => Promise<void>;
}

interface State {
  pythonManagementListProperties: ListConfiguration;
}

class JupyterHubManagementCreateComponent extends React.Component<JupyterHubManagementCreateProps, State> {
  state = {
    pythonManagementListProperties: {
      columns: [
        {
          name: (row: any) => row.instance.name,
          label: translate('Name'),
        },
        {
          name: (row: any) => row.virtualEnvironmentsDirectory,
          label: translate('Virtual environments directory name'),
        },
        {
          name: (row: any) => row.instance.imageName,
          label: translate('Image name'),
        },
        {
          name: (row: any) => row.instance.cores,
          label: translate('vCPU'),
        },
        {
          name: (row: any) => row.instance.ram,
          label: translate('RAM'),
        },
        {
          name: (row: any) => row.instance.disk,
          label: translate('Storage'),
        },
        {
          name: (row: any) => row.instance.state,
          label: translate('Instance state'),
        },
      ],
      choices: this.props.availablePythonManagements,
      selectedValueToShow: selectedValue => selectedValue.name,
    },
  };

  static getDerivedStateFromProps(props: JupyterHubManagementCreateProps, state: State) {
    return {
      pythonManagementListProperties: {
        ...state.pythonManagementListProperties,
        choices: props.availablePythonManagements,
      },
    };
  }

  componentDidUpdate(prevProps: JupyterHubManagementCreateProps) {
    if (this.props.jupyterHubManagement) {
      if (this.props.jupyterHubManagement.selectedPythonManagement && this.hasAuthenticationMethodChangedToOAuth(prevProps)) {
        this.defaultCallbackUrl(this.props.jupyterHubManagement.selectedPythonManagement.instance);
      } else if (this.hasNewPythonManagementBeenSelected(prevProps)) {
        this.defaultCallbackUrl(prevProps.jupyterHubManagement.selectedPythonManagement.instance);
      }
    }
  }

  private defaultCallbackUrl(newInstance: Instance) {
    const jupyterHubOAuthConfig = new JupyterHubOAuthConfig();
    jupyterHubOAuthConfig.oauthCallbackUrl = newInstance ? `https://${newInstance.firstExternalIp}/hub/oauth_callback` : null;
    this.props.change('authenticationConfig.jupyterHubOAuthConfig', jupyterHubOAuthConfig);
  }

  private hasNewPythonManagementBeenSelected(nextProps: JupyterHubManagementCreateProps) {
    return this.props.jupyterHubManagement.selectedPythonManagement
      && this.props.jupyterHubManagement.selectedPythonManagement.uuid !== nextProps.jupyterHubManagement.selectedPythonManagement.uuid;
  }

  private hasAuthenticationMethodChangedToOAuth(nextProps: JupyterHubManagementCreateProps) {
    return this.props.jupyterHubManagement.authenticationConfig.authenticationMethod !== nextProps.jupyterHubManagement.authenticationConfig.authenticationMethod
      && nextProps.jupyterHubManagement.authenticationConfig.authenticationMethod === JupyterHubAuthenticationMethod.OAUTH;
  }

  componentDidMount() {
    this.props.initializeJupyterHubManagementCreate();
  }

  componentWillUnmount() {
    this.props.jupyterHubManagementErred();
  }

  render() {
    if (this.props.erred) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load JupyterHub management details.')}
        </h3>
      );
    }
    if (!this.props.loaded) {
      return <LoadingSpinner/>;
    }
    return (
      <JupyterHubManagementCreateForm
        {...this.props}
        pythonManagementListProperties={this.state.pythonManagementListProperties}/>
    );
  }
}

const mapStateToProps = state => ({
  project: getProject(state),
  waldurPublicKey: getWaldurPublicKey(state),
  waldurPublicKeyUuid: getWaldurPublicKeyUuid(state),
  availablePythonManagements: getAvailablePythonManagements(state),
  loaded: getJupyterHubManagementCreateLoaded(state),
  erred: getJupyterHubManagementCreateErred(state),
  jupyterHubManagement: getFormValues(JUPYTER_HUB_MANAGEMENT_CREATE_FORM_NAME)(state),
});

const mapDispatchToProps = dispatch => ({
  createJupyterHubManagement: data => jupyterHubActions.createJupyterHubManagement(data, dispatch),
  gotoApplicationsList: () => pythonActions.gotoApplicationsList(null, dispatch),
  saveWaldurPublicKey: (waldurPublicKey: string): void => dispatch(pythonActions.saveWaldurPublicKey(waldurPublicKey)),
  initializeJupyterHubManagementCreate: () => jupyterHubActions.initializeJupyterHubManagementCreate(null, dispatch),
  jupyterHubManagementErred: (): void => dispatch(jupyterHubActions.jupyterHubManagementErred()),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: JUPYTER_HUB_MANAGEMENT_CREATE_FORM_NAME, validate: validateJupyterHubManagementForm}),
  withTranslation,
);

const JupyterHubManagementCreateContainer = enhance(JupyterHubManagementCreateComponent);

export default connectAngularComponent(JupyterHubManagementCreateContainer);
