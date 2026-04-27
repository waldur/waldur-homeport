import { FunctionComponent } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const UserAgreementCreateDialog = lazyComponent(() =>
  import('./UserAgreementCreateDialog').then((module) => ({
    default: module.UserAgreementCreateDialog,
  })),
);

export const UserAgreementCreateButton: FunctionComponent<{ refetch }> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={UserAgreementCreateDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
