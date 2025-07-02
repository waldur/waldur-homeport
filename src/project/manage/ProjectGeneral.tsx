import React, { useMemo } from 'react';
import { Project } from 'waldur-js-client';

import FormTable, { FormTableItemProps } from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

import { FieldEditButton } from './FieldEditButton';
import { ProjectAvatar } from './ProjectAvatar';

interface ProjectGeneralProps {
  project: Project;
}

export const ProjectGeneral: React.FC<ProjectGeneralProps> = ({ project }) => {
  const user = useUser();
  const rows = useMemo(
    () =>
      (
        [
          {
            label: translate('Name'),
            key: 'name',
            value: project.name || 'N/A',
          },
          {
            label: translate('Owner'),
            key: 'customer_name',
            value: project.customer_name || 'N/A',
          },
          {
            label: translate('Start date'),
            description: translate(
              'Date when invitations are sent and resource orders processed.',
            ),
            key: 'start_date',
            value: project.start_date || 'N/A',
          },
          {
            label: translate('End date'),
            description: translate(
              'Date when termination orders are created; project is removed if resources are already terminated.',
            ),
            key: 'end_date',
            value: project.end_date || 'N/A',
          },
          {
            label: translate('Description'),
            key: 'description',
            value: project.description || 'N/A',
          },
          user.is_staff && {
            label: translate('Maximum number of service accounts'),
            description: translate(
              'The maximum number of service accounts that can be created in this project.',
            ),
            key: 'max_service_accounts',
            value: project.max_service_accounts
              ? project.max_service_accounts
              : 'N/A',
          },
        ] satisfies Array<{ key: string } & FormTableItemProps>
      ).filter(Boolean),
    [project],
  );

  return (
    <>
      <ProjectAvatar project={project} />

      <FormTable.Card title={translate('Details')} className="card-bordered">
        <FormTable>
          {rows.map((row) => (
            <FormTable.Item
              key={row.key}
              label={row.label}
              description={row.description}
              value={row.value}
              actions={<FieldEditButton project={project} name={row.key} />}
            />
          ))}
        </FormTable>
      </FormTable.Card>
    </>
  );
};
