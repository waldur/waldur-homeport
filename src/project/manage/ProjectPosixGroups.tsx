import { FC } from 'react';
import { Project } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';

import { useProjectPosixGroups } from './useProjectPosixGroups';

interface ProjectPosixGroupsProps {
  project: Project;
}

export const ProjectPosixGroups: FC<ProjectPosixGroupsProps> = ({
  project,
}) => {
  const { data, isLoading } = useProjectPosixGroups(project.uuid);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const rows = data || [];

  return (
    <Panel title={translate('POSIX identities')} cardBordered>
      <p className="text-muted">
        {translate(
          'Group IDs (GIDs) assigned to this project across offerings — both project groups and resource / role groups.',
        )}
      </p>
      {rows.length === 0 ? (
        <p className="mb-0 text-muted">
          {translate('No POSIX group IDs are assigned to this project.')}
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>{translate('GID')}</th>
                <th>{translate('Type')}</th>
                <th>{translate('Offering')}</th>
                <th>{translate('Provider')}</th>
                <th>{translate('Role / scope')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <code>{row.gid}</code>
                  </td>
                  <td>
                    {row.kind === 'project_group'
                      ? translate('Project group')
                      : translate('Role group')}
                  </td>
                  <td>{row.offering_name}</td>
                  <td>{row.provider_name}</td>
                  <td>
                    {row.kind === 'role_group'
                      ? `${row.role} · ${row.scope_type}${
                          row.scope_name ? ' ' + row.scope_name : ''
                        }`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
};
