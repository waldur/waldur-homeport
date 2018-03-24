import * as React from 'react';

import { translate } from '@waldur/i18n';
import { isVirtualEnvironmentNotEditable } from '@waldur/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';

interface RemoveVirtualEnvironmentButtonProps {
  pythonManagement: PythonManagementFormData;
  pythonManagementRequestTimeout: number;
  index: number;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
}

const isDisabled = props =>
  !props.pythonManagement.uuid
  || !props.pythonManagement.virtualEnvironments[props.index].uuid
  || isVirtualEnvironmentNotEditable(props.pythonManagement, props.index, props.pythonManagementRequestTimeout);

export const FindMissingLibrariesButton = (props: RemoveVirtualEnvironmentButtonProps) => (
  <button
    type="button"
    title={translate('Find missing installed libraries')}
    className="btn btn-default"
    disabled={isDisabled(props)}
    onClick={() => props.findInstalledLibsInVirtualEnvironment(props.pythonManagement.uuid, props.pythonManagement.virtualEnvironments[props.index].name)}>
    {translate('Find missing installed libraries')}
  </button>
);
