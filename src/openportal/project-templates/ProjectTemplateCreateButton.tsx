import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

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
