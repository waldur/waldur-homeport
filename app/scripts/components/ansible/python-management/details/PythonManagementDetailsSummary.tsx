import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { PythonManagementActionsHistory } from '@waldur/ansible/python-management/details/PythonManagementActionsHistory';
import { PythonManagementDetailsProps } from '@waldur/ansible/python-management/details/PythonManagementDetailsContainer';
import { PurePythonManagementStatesIndicator } from '@waldur/ansible/python-management/form/PythonManagementState';
import { VirtualEnvironmentsForm } from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import { existsExecutingGlobalRequest } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { FormContainer } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

interface PythonManagementDetailsSummaryProps extends PythonManagementDetailsProps {
  triggerRequestOutputPollingTask: (request: PythonManagementRequest) => Promise<void>;
  updatePythonEnvironment: (formData: PythonManagementFormData) => Promise<void>;
  deletePythonEnvironment: (formData: PythonManagementFormData) => Promise<void>;
  findVirtualEnvironments: (pythonManagementUuid: string) => Promise<void>;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => Promise<void>;
}

export const PythonManagementDetailsSummary = (props: PythonManagementDetailsSummaryProps) => {
  return (
    <div className="wrapper wrapper-content">
      <div className="ibox-content">
        <div className="row m-md">
          <div className="col-md-6">
            <div>
              <h2 className="no-margins">
                {translate('Python management details')}
              </h2>
            </div>
          </div>
        </div>
        <div className="ibox">
          <div className="ibox-content">
            <div className="row">
              <div className="dl-horizontal col-sm-6">

                <form
                  onSubmit={props.handleSubmit(props.updatePythonEnvironment)}
                  className="form-horizontal">
                  <FormContainer
                    submitting={props.submitting}
                    labelClass="col-sm-3"
                    controlClass="col-sm-8">
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('State')}</label>
                      <div className="same-padding-as-control-label">
                        <PurePythonManagementStatesIndicator requestsStates={props.pythonManagement.requestsStateTypePairs}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('Python version')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.pythonVersion}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('Virtual environments root directory')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.virtualEnvironmentsDirectory}
                        <span className="glyphicon glyphicon-info-sign"
                              style={{marginLeft: '10px' }}
                              title={translate('Located in home directory of default system user.')}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-3">{translate('Instance')}</label>
                      <div className="same-padding-as-control-label">
                        <a onClick={() => props.goToInstanceDetails(props.pythonManagement.instance)}>
                          {props.pythonManagement.instance.name}
                        </a>
                      </div>
                    </div>

                    <VirtualEnvironmentsForm reduxFormChange={props.change}
                                             pythonManagement={props.pythonManagement}
                                             findVirtualEnvironments={props.findVirtualEnvironments}
                                             findInstalledLibsInVirtualEnvironment={props.findInstalledLibsInVirtualEnvironment}
                                             pythonManagementRequestTimeout={props.pythonManagementRequestTimeout}/>

                  </FormContainer>

                  <div className="form-group">
                    <div className="col-sm-offset-3 col-sm-7">
                      <button type="submit"
                              className="btn btn-btn-primary btn-xs"
                              disabled={props.submitting || existsExecutingGlobalRequest(props.pythonManagement, props.pythonManagementRequestTimeout)}>
                        <i className="fa fa-shopping-cart"/>
                        {props.translate('Save virtual environments')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => props.deletePythonEnvironment(props.pythonManagement)}
                        disabled={props.submitting || existsExecutingGlobalRequest(props.pythonManagement, props.pythonManagementRequestTimeout)}>
                        <i className="fa fa-trash"/>
                        {translate('Delete python management & virtual environments')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="row">
              <dl className="dl-horizontal col-sm-12">
                <div className="panel-body">
                  <div className="tabs-container m-l-sm">
                    <Tabs defaultActiveKey={1} id={'tabs'}>
                      <Tab eventKey={1} title="Actions history">
                        <PythonManagementActionsHistory
                          pythonManagement={props.pythonManagement}
                          triggerRequestOutputPollingTask={props.triggerRequestOutputPollingTask}
                          unfoldedRequests={props.unfoldedRequests}/>
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
