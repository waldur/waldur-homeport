import { FC } from 'react';

import { RulesForm } from './rule-editor/RulesForm';
import { useRulesEditor } from './rule-editor/utils';
import { SecurityGroup } from './types';

export interface SecurityGroupEditorDialogProps {
  resolve: {
    resource: SecurityGroup;
  };
}

export const SecurityGroupEditorDialog: FC<SecurityGroupEditorDialogProps> = ({
  resolve: { resource },
}) => {
  const formState = useRulesEditor(resource);
  return <RulesForm {...formState} />;
};
