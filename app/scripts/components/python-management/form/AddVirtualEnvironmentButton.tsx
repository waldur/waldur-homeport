import * as React from 'react';

import { translate } from '@waldur/i18n';
import { existsExecutingGlobalRequest, } from '@waldur/python-management/form/VirtualEnvironmentUtils';
import { PythonManagementFormData } from '@waldur/python-management/types/PythonManagementFormData';

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
