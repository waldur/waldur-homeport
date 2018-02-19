import * as React from 'react';

import { isVirtualEnvironmentNotEditable } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { translate } from '@waldur/i18n';

interface RemoveVirtualEnvironmentButtonProps {
  pythonManagement: PythonManagementFormData;
  pythonManagementRequestTimeout: number;
  index: number;
  findInstalledLibsInVirtualEnvironment: (pythonManagementUuid: string, virtualEnvironmentName: string) => void;
}

export const FindMissingLibrariesButton = (props: RemoveVirtualEnvironmentButtonProps) => {
  return (
    <button
      type="button"
      title={translate('Find missing installed libraries')}
      className="btn btn-default"
      disabled={!props.pythonManagement.uuid
      || !props.pythonManagement.virtualEnvironments[props.index].uuid
      || isVirtualEnvironmentNotEditable(props.pythonManagement, props.index, props.pythonManagementRequestTimeout)}
      onClick={() => props.findInstalledLibsInVirtualEnvironment(props.pythonManagement.uuid, props.pythonManagement.virtualEnvironments[props.index].name)}>
      {translate('Find missing installed libraries')}
    </button>
  );
};
