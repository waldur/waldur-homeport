import * as React from 'react';

import { existsExecutingGlobalRequest, } from '@waldur/ansible/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/ansible/python-management/types/PythonManagementFormData';
import { translate } from '@waldur/i18n';

interface AddVirtualEnvironmentButtonProps {
  pythonManagement: PythonManagementFormData;
  pythonManagementRequestTimeout: number;
  addVirtualEnvironment: () => void;
}

export const AddVirtualEnvironmentButton = (props: AddVirtualEnvironmentButtonProps) => {
  return (
    <button type="button"
            className="btn btn-default btn-add-option"
            onClick={props.addVirtualEnvironment}
            disabled={existsExecutingGlobalRequest(props.pythonManagement, props.pythonManagementRequestTimeout)}>
      {translate('Add virtual environment')}
    </button>
  );
};
