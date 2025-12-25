import { FunctionComponent } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const ProjectTemplateDialog = lazyComponent(() =>
  import('./ProjectTemplateDialog').then((module) => ({
    default: module.ProjectTemplateDialog,
  })),
);

export const ProjectTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={ProjectTemplateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
