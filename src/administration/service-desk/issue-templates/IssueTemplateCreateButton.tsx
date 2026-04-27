import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const TemplateCreateDialog = lazyComponent(() =>
  import('./IssueTemplateForm').then((module) => ({
    default: module.IssueTemplateForm,
  })),
);

export const IssueTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={TemplateCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
