import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { ManagementRequestStateTypePair } from '@waldur/ansible/python-management/types/ManagementRequestStateTypePair';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import * as React from 'react';

interface RequestOutputRowProps<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> {
  request: R;
  unfoldedRequests: UnfoldedRequest[];

  additionalInformationSectionBuilder(request: R);
}

export class RequestOutputRow<R extends ManagementRequest<R, RSP>, RSP extends ManagementRequestStateTypePair<RSP>> extends React.Component<RequestOutputRowProps<R, RSP>> {

  state = {
    taskPosition: -1,
  };

  componentWillReceiveProps(nextProps: RequestOutputRowProps<R, RSP>) {
    this.setState({
      taskPosition: this.findTaskPosition(nextProps.request, nextProps.unfoldedRequests),
    });
  }

  findTaskPosition = (request: R, unfoldedRequests: UnfoldedRequest[]) =>
    unfoldedRequests.findIndex(unfoldedRequest => unfoldedRequest.requestUuid === request.uuid)

  isOutputBeingLoadedForTheFirstTime = () => this.props.unfoldedRequests[this.state.taskPosition].loadingForFirstTime;

  render() {
    return (
      this.state.taskPosition !== -1 &&
      (
        <tr>
          <td>
            {this.props.additionalInformationSectionBuilder(this.props.request)
            }
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
