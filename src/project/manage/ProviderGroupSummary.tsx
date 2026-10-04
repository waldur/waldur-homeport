import { FC } from 'react';
import { ProjectPosixGroup } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

import { useProjectPosixGroups } from './useProjectPosixGroups';

export const isProviderGroup = (row: ProjectPosixGroup) =>
  row.kind === 'provider_project_group';

/** "At this provider, your files use this group": the gist, in one line each. */
export const ProviderGroupSummary: FC<{ projectUuid: string }> = ({
  projectUuid,
}) => {
  const { data } = useProjectPosixGroups(projectUuid);
  const groups = (data ?? []).filter(isProviderGroup);
  if (!groups.length) {
    return null;
  }
  return (
    <ul className="ps-4 mb-0" data-testid="provider-group-summary">
      {groups.map((group) => (
        <li key={group.group_uuid ?? group.provider_name}>
          {group.gid == null
            ? translate(
                'At {provider}, the project has group {name}; it gets a GID once the provider can assign one.',
                { provider: group.provider_name, name: group.group_name },
              )
            : translate(
                'Files and cluster access at {provider} use group {name}, GID {gid}.',
                {
                  provider: group.provider_name,
                  name: group.group_name,
                  gid: group.gid,
                },
              )}
        </li>
      ))}
    </ul>
  );
};

/** The rollup could not be loaded: say so, and offer to try again. */
export const RollupError: FC<{ retry: () => void }> = ({ retry }) => (
  <AlertItem
    variant="error"
    title={translate('Unable to load the POSIX groups of this project.')}
    data-testid="posix-groups-error"
    actions={
      <BaseButton
        label={translate('Try again')}
        onClick={retry}
        variant="tertiary"
        size="sm"
      />
    }
  />
);
