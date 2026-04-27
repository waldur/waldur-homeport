import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';

import { useProjectDelete } from '../useProjectDelete';

interface ProjectDeleteProps {
  project: Project;
}

export const ProjectDelete: FC<ProjectDeleteProps> = ({ project }) => {
  const { canDelete, callback } = useProjectDelete({ project });

  return (
    <Panel
      title={translate('Delete project')}
      cardBordered
      actions={
        <ActionButton
          action={callback}
          title={translate('Delete')}
          iconNode={<TrashIcon weight="bold" />}
          variant="danger"
          disabled={!canDelete}
          tooltip={
            project.is_removed
              ? translate('Project has already been removed')
              : undefined
          }
        />
      }
    >
      <ul className="text-gray-700">
        {project.is_removed ? (
          <li className="text-muted">
            {translate(
              'This project has already been removed and cannot be deleted again.',
            )}
          </li>
        ) : (
          <>
            <li>
              {translate(
                'You can remove this project by pressing the button above.',
              )}
            </li>
            <li>
              {translate(
                'Only projects without existing resources can be removed.',
              )}
            </li>
            <li>{translate('Removed projects cannot be restored.')}</li>
          </>
        )}
      </ul>
    </Panel>
  );
};
