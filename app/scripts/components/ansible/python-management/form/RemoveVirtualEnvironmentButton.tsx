import * as React from 'react';

import { isVirtualEnvironmentNotEditable } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { translate } from '@waldur/i18n';

interface RemoveVirtualEnvironmentButtonProps {
  pythonManagement: PythonManagementFormData;
  pythonManagementRequestTimeout: number;
  index: number;
  removeVirtualEnvironment: () => void;
}

export const RemoveVirtualEnvironmentButton = (props: RemoveVirtualEnvironmentButtonProps) => {
  return (
    <button
      type="button"
      title={translate('Remove virtual environment')}
      className="btn btn-default"
      disabled={isVirtualEnvironmentNotEditable(props.pythonManagement, props.index, props.pythonManagementRequestTimeout)}
      onClick={props.removeVirtualEnvironment}>X
    </button>
  );
};
