import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';

import { PythonManagementActionsHistory } from '@waldur/ansible/python-management/details/PythonManagementActionsHistory';
import { PythonManagementDetailsProps } from '@waldur/ansible/python-management/details/PythonManagementDetailsContainer';
import { VirtualEnvironmentsForm } from '@waldur/ansible/python-management/form/VirtualEnvironmentsForm';
import { existsExecutingGlobalRequest } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementRequest } from '@waldur/ansible/python-management/types/PythonManagementRequest';
import { PythonManagementRequestType } from '@waldur/ansible/python-management/types/PythonManagementRequestType';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { FormContainer } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

import { buildStateIndicator } from '../state-builder/StateIndicatorBuilder';

export const PythonManagementDetailsSummary = (props: PythonManagementDetailsProps) => {
  const buildRequestAdditionalInfo = (request: PythonManagementRequest) => {
    return request.requestType === PythonManagementRequestType.SYNCHRONIZATION &&
      (
        <>
        {translate('Libraries to install')}:
        <ul>
          {request.librariesToInstall.map((lib, index) => (
            <li key={index}>{lib.name}=={lib.version}</li>
          ))}
        </ul>
        {translate('Libraries to remove')}:
        <ul>
          {request.librariesToRemove.map((lib, index) => (
            <li key={index}>{lib.name}=={lib.version}</li>
          ))}
        </ul>
        </>
      );
  };

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
              <div className="dl-horizontal col-sm-12">

                <form
                  onSubmit={props.handleSubmit(props.updatePythonEnvironment)}
                  className="form-horizontal">
                  <FormContainer
                    submitting={props.submitting}
                    labelClass="col-sm-2"
                    controlClass="col-sm-10">
                    <div className="form-group">
                      <label className="control-label col-sm-2">{translate('State')}</label>
                      <div className="same-padding-as-control-label">
                        <StateIndicator {...buildStateIndicator(props.pythonManagement.managementState)}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-2">{translate('Python version')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.pythonVersion}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-2">{translate('Virtual environments root directory')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.virtualEnvironmentsDirectory}
                        <span className="fa fa-info-circle"
                              style={{marginLeft: '10px' }}
                              title={translate('Located in home directory of the specified system user.')}/>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-2">{translate('System user')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.systemUser}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="control-label col-sm-2">{translate('Instance')}</label>
                      <div className="same-padding-as-control-label">
                        {props.pythonManagement.instance ?
                          <a onClick={() => props.goToInstanceDetails(props.pythonManagement.instance)}>
                            {props.pythonManagement.instance.name}
                          </a>
                          : translate('Associated virtual machine was deleted!')
                        }
                      </div>
                    </div>

                    <VirtualEnvironmentsForm reduxFormChange={props.change}
                                             pythonManagement={props.pythonManagement}
                                             findVirtualEnvironments={props.findVirtualEnvironments}
                                             findInstalledLibsInVirtualEnvironment={props.findInstalledLibsInVirtualEnvironment}
                                             managementRequestTimeout={props.pythonManagementRequestTimeout}
                                             jupyterHubMode={false}
                                             pathToVirtualEnvironments={'virtualEnvironments'}/>

                  </FormContainer>

                  <div className="form-group">
                    <div className="col-sm-offset-2">
                      <div className="col-sm-3">
                        <button type="submit"
                                className="btn btn-btn-primary btn-xs"
                                disabled={props.submitting || existsExecutingGlobalRequest(props.pythonManagement, props.pythonManagementRequestTimeout)}>
                          <i className="fa fa-save"/>
                          {props.translate('Save virtual environments')}
                        </button>
                      </div>
                      <div className="col-sm-3">
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
                          requests={props.pythonManagement.requests}
                          triggerRequestOutputPollingTask={props.triggerRequestOutputPollingTask}
                          unfoldedRequests={props.unfoldedRequests}
                          additionalInformationSectionBuilder={buildRequestAdditionalInfo}/>
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
