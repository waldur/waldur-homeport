import { FC } from 'react';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';

const RequestTypeFormDialog = lazyComponent(() =>
  import('./RequestTypeForm').then((module) => ({
    default: module.RequestTypeForm,
  })),
);

interface RequestTypeCreateButtonProps {
  refetch: () => void;
}

export const RequestTypeCreateButton: FC<RequestTypeCreateButtonProps> = ({
  refetch,
}) => (
  <CreateModalButton
    dialog={RequestTypeFormDialog}
    resolve={{ refetch }}
    size="lg"
  />
);
