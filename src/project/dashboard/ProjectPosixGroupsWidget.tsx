import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import {
  isProviderGroup,
  ProviderGroupSummary,
  RollupError,
} from '@/project/manage/ProviderGroupSummary';
import {
  isProjectPosixGroupsVisible,
  useProjectPosixGroups,
} from '@/project/manage/useProjectPosixGroups';

/**
 * Which group and GID the project has at each service provider, on the
 * overview: members do not reach the project's settings from the menus.
 */
export const ProjectPosixGroupsWidget: FC<{ project: Project }> = ({
  project,
}) => {
  const { data, isError, refetch } = useProjectPosixGroups(project.uuid);
  // Hidden where POSIX identities are off, groups or not.
  if (!isProjectPosixGroupsVisible()) {
    return null;
  }
  if (!isError && !(data ?? []).some(isProviderGroup)) {
    return null;
  }
  return (
    <Panel
      title={translate('POSIX groups')}
      cardBordered
      className="mb-5"
      actions={
        <Link
          state="project-manage"
          params={{ uuid: project.uuid, tab: 'posix-identities' }}
          label={translate('Show details')}
          buttonVariant="text-primary"
          buttonSize="sm"
        />
      }
    >
      {isError ? (
        <RollupError retry={() => refetch()} />
      ) : (
        <ProviderGroupSummary projectUuid={project.uuid} />
      )}
    </Panel>
  );
};
