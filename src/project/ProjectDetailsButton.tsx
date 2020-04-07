import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { Project } from '@waldur/workspace/types';

const openProjectDialog = (project: Project) =>
  openModalDialog('projectDialog', { resolve: { project }, size: 'lg' });

export const ProjectDetailsButton = ({ project }: { project: Project }) => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () => dispatch(openProjectDialog(project)),
    [project],
  );
  return (
    <ActionButton
      title={translate('Details')}
      action={callback}
      icon="fa fa-eye"
    />
  );
};

export default connectAngularComponent(ProjectDetailsButton, ['project']);
