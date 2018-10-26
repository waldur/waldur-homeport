import * as React from 'react';

import { ManagementRequest } from '@waldur/ansible/python-management/types/ManagementRequest';
import { UnfoldedRequest } from '@waldur/ansible/python-management/types/UnfoldedRequest';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';

interface RequestOutputRowProps<R extends ManagementRequest<R>> {
  request: R;
  unfoldedRequests: UnfoldedRequest[];

  additionalInformationSectionBuilder(request: R);
}

export class RequestOutputRow<R extends ManagementRequest<R>> extends React.Component<RequestOutputRowProps<R>> {

  state = {
    taskPosition: -1,
  };

  static getDerivedStateFromProps(props) {
    return {
      taskPosition: this.findTaskPosition(props.request, props.unfoldedRequests),
    };
  }

  static findTaskPosition(request, unfoldedRequests: UnfoldedRequest[]) {
    return unfoldedRequests.findIndex(unfoldedRequest => unfoldedRequest.requestUuid === request.uuid);
  }

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
