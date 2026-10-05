import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

const ProjectTemplateDialog = lazyComponent(() =>
  import('./ProjectTemplateDialog').then((module) => ({
    default: module.ProjectTemplateDialog,
  })),
);

// The API accepts a template only from staff or an owner of the provider
// organization; no permission grants it.
export const ProjectTemplateCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => {
  const user = useUser();
  const customer = useCustomer();
  if (!checkIsOwnerOrStaff(customer, user)) {
    return null;
  }
  return (
    <CreateModalButton
      dialog={ProjectTemplateDialog}
      resolve={{ refetch }}
      size="lg"
    />
  );
};
