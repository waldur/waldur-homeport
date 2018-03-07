import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { PythonManagementRequest } from '@waldur/python-management/types/PythonManagementRequest';
import { PythonManagementRequestType } from '@waldur/python-management/types/PythonManagementRequestType';
import { UnfoldedRequest } from '@waldur/python-management/types/UnfoldedRequest';

interface RequestOutputRowProps {
  request: PythonManagementRequest;
  unfoldedRequests: UnfoldedRequest[];
}

export class RequestOutputRow extends React.Component<RequestOutputRowProps> {

  state = {
    taskPosition: -1,
  };

  componentWillReceiveProps(nextProps: RequestOutputRowProps) {
    this.setState({
      taskPosition: this.findTaskPosition(nextProps.request, nextProps.unfoldedRequests),
    });
  }

  findTaskPosition = (request: PythonManagementRequest, unfoldedRequests: UnfoldedRequest[]) =>
    unfoldedRequests.findIndex(unfoldedRequest => unfoldedRequest.requestUuid === request.uuid)

  isOutputBeingLoadedForTheFirstTime = () => this.props.unfoldedRequests[this.state.taskPosition].loadingForFirstTime;

  render() {
    return (
      this.state.taskPosition !== -1 &&
      (
        <tr>
          <td>
            {this.props.request.requestType === PythonManagementRequestType.SYNCHRONIZATION ?
              <>
                {translate('Libraries to install')}:
                <ul>
                  {this.props.request.librariesToInstall.map((lib, index) => (
                    <li key={index}>{lib.name} == {lib.version}</li>
                  ))}
                </ul>
                {translate('Libraries to remove')}:
                <ul>
                  {this.props.request.librariesToRemove.map((lib, index) => (
                    <li key={index}>{lib.name} == {lib.version}</li>
                  ))}
                </ul>
              </> : null}
          </td>
          <td colSpan={3}>
            {this.isOutputBeingLoadedForTheFirstTime() ?
              (<LoadingSpinner/>)
              : (<pre className="pre-scrollable" style={{maxWidth: '1000px'}}>{this.props.request.output}</pre>)
            }
          </td>
        </tr>
      )
    );
  }
}
