import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { Project } from '@waldur/workspace/types';

import { ProjectDetailsDialog } from './ProjectDetailsDialog';

const openProjectDialog = (project: Project) =>
  openModalDialog(ProjectDetailsDialog, { resolve: { project }, size: 'lg' });

export const ProjectDetailsButton = ({ project }: { project: Project }) => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () => dispatch(openProjectDialog(project)),
    [dispatch, project],
  );
  return (
    <ActionButton
      title={translate('Details')}
      action={callback}
      icon="fa fa-eye"
    />
  );
};
