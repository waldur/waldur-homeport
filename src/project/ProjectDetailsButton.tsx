import { Eye } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';

import { translate } from '@waldur/i18n/translate';
import { RowActionButton } from '@waldur/table/ActionButton';
import { Project } from '@waldur/workspace/types';

export const ProjectDetailsButton = ({ project }: { project: Project }) => {
  const router = useRouter();
  return (
    <RowActionButton
      title={translate('Details')}
      action={() =>
        router.stateService.go('project-manage', { uuid: project.uuid })
      }
      iconNode={<Eye />}
      size="sm"
    />
  );
};
