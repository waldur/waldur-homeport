import * as React from 'react';

import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import * as actions from '@waldur/ansible/python-management/actions';
import { PYTHON_MANAGEMENT_DETAILS_FORM_NAME } from '@waldur/ansible/python-management/constants';
import { PythonManagementDetailsSummary } from '@waldur/ansible/python-management/details/PythonManagementDetailsSummary';
import {
  getAnsibleRequestTimeout,
  getPythonManagementErred,
  getPythonManagementLoaded,
  getUnfoldedRequests
} from '@waldur/ansible/python-management/selectors';
import { InstalledLibrariesSearchDs } from '@waldur/ansible/python-management/types/InstalledLibrariesSearchDs';
import { Instance } from '@waldur/ansible/python-management/types/Instance';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n/index';
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';

export interface PythonManagementDetailsProps extends InjectedFormProps, TranslateProps {
  project: any;
  pythonManagementRequestTimeout: number;
  loaded: boolean;
  erred: boolean;
  unfoldedRequests: UnfoldedRequest[];
  goToInstanceDetails: (instance: Instance) => void;
  initializePythonManagementDetailsDialogue: (uuid: string) => Promise<void>;
  pythonManagement: PythonManagementFormData;
  updatePythonEnvironment: (pythonManagement: PythonManagementFormData) => Promise<void>;
  deletePythonEnvironment: (pythonManagement: PythonManagementFormData) => Promise<void>;
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => Promise<void>;
  findVirtualEnvironments: (uuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
  clearDetailsPollingTask: () => void;
  clearUnfoldedRequests: () => void;
  pythonManagementErred: () => void;
}

class PythonManagementDetailsComponent extends React.Component<PythonManagementDetailsProps> {

  componentDidMount() {
    this.props.initializePythonManagementDetailsDialogue($state.params.pythonManagementUuid);
  }

  componentWillUnmount() {
    this.props.clearUnfoldedRequests();
    this.props.clearDetailsPollingTask();
    this.props.pythonManagementErred();
  }

  render() {
    if (this.props.erred) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load python management details.')}
        </h3>
      );
    }
    if (!this.props.loaded) {
      return <LoadingSpinner/>;
    }
    return (
      <PythonManagementDetailsSummary {...this.props}/>
    );
  }
}

const mapStateToProps = state => ({
  project: getProject(state),
  pythonManagementRequestTimeout: getAnsibleRequestTimeout(state),
  pythonManagement: getFormValues(PYTHON_MANAGEMENT_DETAILS_FORM_NAME)(state),
  unfoldedRequests: getUnfoldedRequests(state),
  loaded: getPythonManagementLoaded(state),
  erred: getPythonManagementErred(state),
});

const mapDispatchToProps = dispatch => ({
  createPythonManagement: data => actions.createPythonManagement(data, dispatch),
  gotoApplicationsList: () => actions.gotoApplicationsList(null, dispatch),
  goToInstanceDetails: (instance: Instance) => actions.goToInstanceDetails(instance.uuid, dispatch),
  initializePythonManagementDetailsDialogue: (uuid: string) => actions.initializePythonManagementDetailsDialogue(uuid, dispatch),
  updatePythonEnvironment: (pythonManagement: PythonManagementFormData) => actions.updatePythonManagement(pythonManagement, dispatch),
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => actions.triggerRequestOutputPollingTask(request, dispatch),
  deletePythonEnvironment: (pythonManagement: PythonManagementFormData) => actions.deletePythonManagement(pythonManagement, dispatch),
  findVirtualEnvironments: (pythonManagementUuid: string) => actions.findVirtualEnvironments(pythonManagementUuid, dispatch),
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) =>
    actions.findInstalledLibsInVirtualEnvironment(new InstalledLibrariesSearchDs(pythonManagementUuid, virtualEnvironmentName), dispatch),
  clearDetailsPollingTask: (): void => dispatch(actions.clearDetailsPollingTask()),
  clearUnfoldedRequests: (): void => dispatch(actions.clearUnfoldedRequests()),
  pythonManagementErred: (): void => dispatch(actions.pythonManagementErred()),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({form: PYTHON_MANAGEMENT_DETAILS_FORM_NAME}),
  withTranslation,
);

const PythonManagementDetailsContainer = enhance(PythonManagementDetailsComponent);

export default connectAngularComponent(PythonManagementDetailsContainer);
