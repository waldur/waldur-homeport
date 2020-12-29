import { FC } from 'react';

import { RulesForm } from './rule-editor/RulesForm';
import { useRulesEditor } from './rule-editor/utils';
import { SecurityGroup } from './types';

interface SecurityGroupEditorDialogProps {
  resolve: {
    resource: SecurityGroup;
  };
}

export const SecurityGroupEditorDialog: FC<SecurityGroupEditorDialogProps> = ({
  resolve: { resource },
}) => {
  const { asyncState, submitRequest } = useRulesEditor(resource);
  return (
    <RulesForm
      resourceName={resource.name.toUpperCase()}
      asyncState={asyncState}
      submitRequest={submitRequest}
      initialValues={{ rules: resource.rules }}
    />
  );
};
