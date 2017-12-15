import * as React from 'react';

import { $state } from '@waldur/core/services';

interface Props {
  row: {
    project_name: string,
    project_uuid: string,
  };
}

const ProjectLink = ({ row }: Props) => {
  const href = $state.href('project', {uuid: row.project_uuid});
  return <a href={href}>{row.project_name}</a>;
};

export default ProjectLink;
