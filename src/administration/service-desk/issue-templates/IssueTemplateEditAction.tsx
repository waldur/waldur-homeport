import { FunctionComponent } from 'react';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const TemplateEditDialog = lazyComponent(() =>
  import('./IssueTemplateForm').then((module) => ({
    default: module.IssueTemplateForm,
  })),
);

export const IssueTemplateEditAction: FunctionComponent<{
  row;
  refetch;
}> = ({ row, refetch }) => (
  <EditModalButton
    dialog={TemplateEditDialog}
    row={row}
    buildResolve={(r) => ({ issueTemplate: r, refetch })}
    size="lg"
  />
);
