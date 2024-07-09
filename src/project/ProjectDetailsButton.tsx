import { Eye } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';
import { Project } from '@waldur/workspace/types';

const ProjectDetailsDialog = lazyComponent(
  () => import('./ProjectDetailsDialog'),
  'ProjectDetailsDialog',
);

const openProjectDialog = (project: Project) =>
  openModalDialog(ProjectDetailsDialog, { resolve: { project }, size: 'lg' });

export const ProjectDetailsButton = ({ project }: { project: Project }) => {
  const dispatch = useDispatch();
  const callback = useCallback(
    () => dispatch(openProjectDialog(project)),
    [dispatch, project],
  );
  return (
    <RowActionButton
      title={translate('Details')}
      action={callback}
      iconNode={<Eye />}
      size="sm"
    />
  );
};
