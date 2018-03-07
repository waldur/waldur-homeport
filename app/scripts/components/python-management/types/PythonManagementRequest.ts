import { Library } from '@waldur/python-management/types/Library';
import { PythonManagementRequestState } from '@waldur/python-management/types/PythonManagementRequestState';
import { PythonManagementRequestType } from '@waldur/python-management/types/PythonManagementRequestType';

export class PythonManagementRequest {
  uuid: string;
  requestState: PythonManagementRequestState;
  requestType: PythonManagementRequestType;
  created: Date;
  output: string;
  virtualEnvironmentName: string;
  librariesToInstall: Library[];
  librariesToRemove: Library[];

  static isGlobalRequest(request: PythonManagementRequest): boolean {
    return !request.virtualEnvironmentName;
  }

  static isExecuting(request: PythonManagementRequest, timeout: number): boolean {
    const differenceInSeconds = ((new Date()).valueOf() - request.created.valueOf()) / 1000;
    return differenceInSeconds < timeout
      && request.requestState !== PythonManagementRequestState.OK
      && request.requestState !== PythonManagementRequestState.ERRED;
  }
}
