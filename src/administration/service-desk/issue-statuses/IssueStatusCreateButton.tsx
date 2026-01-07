import { FC } from 'react';

import { CreateModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const IssueStatusFormDialog = lazyComponent(() =>
  import('./IssueStatusForm').then((module) => ({
    default: module.IssueStatusForm,
  })),
);

interface IssueStatusCreateButtonProps {
  refetch: () => void;
}

export const IssueStatusCreateButton: FC<IssueStatusCreateButtonProps> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={IssueStatusFormDialog}
    resolve={{ refetch }}
    size="sm"
  />
);
