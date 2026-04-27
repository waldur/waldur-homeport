import React from 'react';
import { RancherProject } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const ProjectExpandableRow: React.FC<{
  row: RancherProject;
}> = ({ row: project }) => {
  return (
    <ExpandableContainer>
      {project.namespaces.length === 0 ? (
        <p>{translate('There are not namespaces in this project yet.')}</p>
      ) : (
        <ul>
          {project.namespaces.map((namespace) => (
            <li key={namespace.uuid}>{namespace.name}</li>
          ))}
        </ul>
      )}
    </ExpandableContainer>
  );
};
