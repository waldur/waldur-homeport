import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import * as jupyterHubActions from '@waldur/ansible/jupyter-hub-management/actions';
import { JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME } from '@waldur/ansible/jupyter-hub-management/constants';
import { JupyterHubManagementDetailsForm } from '@waldur/ansible/jupyter-hub-management/details/JupyterHubManagementDetailsForm';
import {
  getJupyterHubManagementDetailsErred,
  getJupyterHubManagementDetailsLoaded
} from '@waldur/ansible/jupyter-hub-management/selectors';
import { JupyterHubManagementDetailsFormData } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementDetailsFormData';
import { JupyterHubManagementRequest } from '@waldur/ansible/jupyter-hub-management/types/JupyterHubManagementRequest';
import { validateJupyterHubManagementForm } from '@waldur/ansible/jupyter-hub-management/validation';
import * as pythonActions from '@waldur/ansible/python-management/actions';
import { getAnsibleRequestTimeout, getUnfoldedRequests } from '@waldur/ansible/python-management/selectors';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

export interface JupyterHubManagementDetailsProps extends InjectedFormProps, TranslateProps {
  project: Project;
  loaded: boolean;
  erred: boolean;
  managementRequestTimeout: number;
  unfoldedRequests: UnfoldedRequest[];
  jupyterHubManagement: JupyterHubManagementDetailsFormData;
  clearDetailsPollingTask: () => void;
  clearUnfoldedRequests: () => void;
  jupyterHubManagementErred: () => Promise<void>;
  updateJupyterHubManagement: (jupyterHubManagement: JupyterHubManagementDetailsFormData) => Promise<void>;
  deleteJupyterHubManagement: (jupyterHubManagement: JupyterHubManagementDetailsFormData) => Promise<void>;
  initializeJupyterHubManagementDetails: (uuid: string) => Promise<void>;
  gotoPythonManagementDetails: (pythonManagementUuid: string) => Promise<void>;
  triggerJupyterHubRequestOutputPollingTask: (request: JupyterHubManagementRequest) => void;
}

class JupyterHubManagementDetailsComponent extends React.Component<JupyterHubManagementDetailsProps> {

  componentDidMount() {
    this.props.initializeJupyterHubManagementDetails($state.params.jupyterHubManagementUuid);
  }

  componentWillUnmount() {
    this.props.clearUnfoldedRequests();
    this.props.clearDetailsPollingTask();
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
      <JupyterHubManagementDetailsForm {...this.props}/>
    );
  }
}

const mapStateToProps = state => ({
  project: getProject(state),
  jupyterHubManagement: getFormValues(JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME)(state),
  managementRequestTimeout: getAnsibleRequestTimeout(state),
  unfoldedRequests: getUnfoldedRequests(state),
  loaded: getJupyterHubManagementDetailsLoaded(state),
  erred: getJupyterHubManagementDetailsErred(state),
});

const mapDispatchToProps = dispatch => ({
  createJupyterHubManagement: data => jupyterHubActions.createJupyterHubManagement(data, dispatch),
  gotoApplicationsList: () => pythonActions.gotoApplicationsList(null, dispatch),
  gotoPythonManagementDetails: (pythonManagementUuid: string) => pythonActions.goToPythonManagementDetails(pythonManagementUuid, dispatch),
  updateJupyterHubManagement: (jupyterHubManagement: JupyterHubManagementDetailsFormData) => jupyterHubActions.updateJupyterHubManagement(jupyterHubManagement, dispatch),
  deleteJupyterHubManagement: (jupyterHubManagement: JupyterHubManagementDetailsFormData) => jupyterHubActions.deleteJupyterHubManagement(jupyterHubManagement, dispatch),
  initializeJupyterHubManagementDetails: (jupyterHubUuid: string) => jupyterHubActions.initializeJupyterHubManagementDetails(jupyterHubUuid, dispatch),
  clearDetailsPollingTask: (): void => dispatch(pythonActions.clearDetailsPollingTask()),
  clearUnfoldedRequests: (): void => dispatch(pythonActions.clearUnfoldedRequests()),
  jupyterHubManagementErred: (): void => dispatch(jupyterHubActions.jupyterHubManagementErred()),
  triggerJupyterHubRequestOutputPollingTask: (request: JupyterHubManagementRequest) => jupyterHubActions.triggerJupyterHubRequestOutputPollingTask(request, dispatch),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: JUPYTER_HUB_MANAGEMENT_DETAILS_FORM_NAME, validate: validateJupyterHubManagementForm}),
  withTranslation,
);

const JupyterHubManagementDetailsContainer = enhance(JupyterHubManagementDetailsComponent);

export default connectAngularComponent(JupyterHubManagementDetailsContainer);
