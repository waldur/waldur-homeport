import React, { useMemo } from 'react';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Project } from '@waldur/workspace/types';

import { FieldEditButton } from './FieldEditButton';

interface ProjectGeneralProps {
  project: Project;
}

export const ProjectGeneral: React.FC<ProjectGeneralProps> = ({ project }) => {
  const rows = useMemo(
    () => [
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
        key: 'start_date',
        value: project.start_date || 'N/A',
      },
      {
        label: translate('End date'),
        key: 'end_date',
        value: project.end_date || 'N/A',
      },
      {
        label: translate('Description'),
        key: 'description',
        value: project.description || 'N/A',
      },
    ],
    [project],
  );

  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        {rows.map((row) => (
          <FormTable.Item
            key={row.key}
            label={row.label}
            value={row.value}
            actions={<FieldEditButton project={project} name={row.key} />}
          />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
